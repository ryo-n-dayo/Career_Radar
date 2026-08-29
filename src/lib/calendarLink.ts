import type { EventItem } from "@/features/events/types/eventItem";
import { EVENT_KIND_LABEL, locationLabel } from "@/features/events/types/eventItem";

/** Google カレンダー / iCalendar が要求する UTC 形式: 20260901T090000Z */
function toUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** 終了時刻が無いイベントは 2 時間枠として扱う */
function resolveRange(event: EventItem): { start: Date; end: Date } {
  const start = new Date(event.startsAt);
  const end = event.endsAt ? new Date(event.endsAt) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return { start, end };
}

function buildDescription(event: EventItem): string {
  const lines = [
    event.description?.trim(),
    event.prize ? `賞金・特典: ${event.prize}` : undefined,
    event.applyDeadline ? `応募締切: ${new Date(event.applyDeadline).toLocaleString("ja-JP")}` : undefined,
    event.organizer ? `主催: ${event.organizer}` : undefined,
    event.url
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n\n");
}

/**
 * Google カレンダーの「予定を追加」画面を開くリンク。
 * OAuth を必要とせず、ログイン中のユーザーのカレンダーに追加できる。
 */
export function googleCalendarUrl(event: EventItem): string {
  const { start, end } = resolveRange(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `[${EVENT_KIND_LABEL[event.kind]}] ${event.title}`,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    details: buildDescription(event),
    location: event.venue ?? locationLabel(event)
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** iCalendar の TEXT 値はカンマ・セミコロン・改行のエスケープが必要 */
function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Apple カレンダーなど向けの .ics 本文 */
export function buildIcs(event: EventItem): string {
  const { start, end } = resolveRange(event);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Event Hub//JA",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@event-hub`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${escapeIcsText(`[${EVENT_KIND_LABEL[event.kind]}] ${event.title}`)}`,
    `DESCRIPTION:${escapeIcsText(buildDescription(event))}`,
    `LOCATION:${escapeIcsText(event.venue ?? locationLabel(event))}`,
    `URL:${event.url}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  return lines.join("\r\n");
}

/** ダウンロード用のファイル名。日本語タイトルはそのままだと扱いづらいので id を使う。 */
export function icsFileName(event: EventItem): string {
  return `event-${event.id}.ics`;
}
