import { googleFetch, GoogleConnectionError } from "./client";
import { isRelevantGoogleMail } from "../mailRelevance";
import { prisma } from "@/lib/prisma";

type GmailHeader = { name?: string; value?: string };
type GmailMessage = { id?: string; threadId?: string; labelIds?: string[]; snippet?: string; internalDate?: string; payload?: { headers?: GmailHeader[] } };
type CalendarEvent = { id?: string; summary?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string }; location?: string; htmlLink?: string; updated?: string; status?: string };

function header(message: GmailMessage, name: string): string | undefined {
  return message.payload?.headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())?.value?.trim();
}

function safeDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calendarDate(value: { dateTime?: string; date?: string } | undefined): { date: Date; allDay: boolean } | null {
  const raw = value?.dateTime ?? value?.date;
  const date = safeDate(raw);
  return date ? { date, allDay: Boolean(value?.date && !value.dateTime) } : null;
}

async function readJson<T>(response: Response, message: string): Promise<T> {
  const data = await response.json().catch(() => null) as T | null;
  if (!response.ok || !data) throw new GoogleConnectionError(message);
  return data;
}

export type GoogleSyncResult = { gmail: number; calendar: number };

export async function syncGoogleWorkspace(): Promise<GoogleSyncResult> {
  try {
    const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
    listUrl.searchParams.set("labelIds", "INBOX");
    listUrl.searchParams.set("maxResults", "50");
    listUrl.searchParams.set("q", "newer_than:120d");
    const listed = await readJson<{ messages?: Array<{ id?: string }> }>(await googleFetch(listUrl.toString()), "Gmailの一覧を取得できませんでした");
    let gmail = 0;
    for (const item of listed.messages ?? []) {
      if (!item.id) continue;
      const messageUrl = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(item.id)}`);
      messageUrl.searchParams.set("format", "metadata");
      messageUrl.searchParams.append("metadataHeaders", "From");
      messageUrl.searchParams.append("metadataHeaders", "Subject");
      messageUrl.searchParams.append("metadataHeaders", "Date");
      const message = await readJson<GmailMessage>(await googleFetch(messageUrl.toString()), "Gmailのメール情報を取得できませんでした");
      const subject = header(message, "Subject") || "（件名なし）";
      const fromAddress = header(message, "From");
      if (!isRelevantGoogleMail({ fromAddress, subject, snippet: message.snippet })) continue;
      const receivedAt = message.internalDate ? safeDate(String(message.internalDate)) : safeDate(header(message, "Date"));
      await prisma.googleGmailMessage.upsert({
        where: { connectionId_externalId: { connectionId: "google", externalId: item.id } },
        update: { threadId: message.threadId ?? null, fromAddress: fromAddress ?? null, subject, snippet: message.snippet?.slice(0, 280) ?? null, receivedAt, labels: message.labelIds ?? [], gmailUrl: `https://mail.google.com/mail/u/0/#all/${item.id}`, isRelevant: true, syncedAt: new Date() },
        create: { connectionId: "google", externalId: item.id, threadId: message.threadId ?? null, fromAddress, subject, snippet: message.snippet?.slice(0, 280), receivedAt, labels: message.labelIds ?? [], gmailUrl: `https://mail.google.com/mail/u/0/#all/${item.id}`, isRelevant: true }
      });
      gmail += 1;
    }

    const now = new Date();
    const eventsUrl = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    eventsUrl.searchParams.set("timeMin", new Date(now.getTime() - 14 * 86_400_000).toISOString());
    eventsUrl.searchParams.set("timeMax", new Date(now.getTime() + 180 * 86_400_000).toISOString());
    eventsUrl.searchParams.set("singleEvents", "true");
    eventsUrl.searchParams.set("orderBy", "startTime");
    eventsUrl.searchParams.set("maxResults", "100");
    const events = await readJson<{ items?: CalendarEvent[] }>(await googleFetch(eventsUrl.toString()), "Google Calendarの予定を取得できませんでした");
    let calendar = 0;
    for (const item of events.items ?? []) {
      if (!item.id || item.status === "cancelled") continue;
      const start = calendarDate(item.start);
      if (!start) continue;
      const end = calendarDate(item.end);
      await prisma.googleCalendarEvent.upsert({
        where: { connectionId_externalId: { connectionId: "google", externalId: item.id } },
        update: { calendarId: "primary", calendarName: "メイン カレンダー", summary: item.summary?.trim() || "（タイトルなし）", startsAt: start.date, endsAt: end?.date ?? null, isAllDay: start.allDay, location: item.location?.slice(0, 180) ?? null, htmlLink: item.htmlLink ?? null, googleUpdatedAt: safeDate(item.updated), status: item.status ?? null, syncedAt: new Date() },
        create: { connectionId: "google", externalId: item.id, calendarId: "primary", calendarName: "メイン カレンダー", summary: item.summary?.trim() || "（タイトルなし）", startsAt: start.date, endsAt: end?.date, isAllDay: start.allDay, location: item.location?.slice(0, 180), htmlLink: item.htmlLink, googleUpdatedAt: safeDate(item.updated), status: item.status }
      });
      calendar += 1;
    }
    await prisma.googleConnection.update({ where: { id: "google" }, data: { gmailLastSyncedAt: new Date(), calendarLastSyncedAt: new Date(), lastError: null } });
    return { gmail, calendar };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google連携の同期に失敗しました";
    await prisma.googleConnection.update({ where: { id: "google" }, data: { lastError: message.slice(0, 300) } }).catch(() => null);
    throw error;
  }
}
