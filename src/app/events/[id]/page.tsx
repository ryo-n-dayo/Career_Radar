import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getEventById } from "@/features/events/server/getEvents";
import {
  EVENT_FORMAT_LABEL,
  EVENT_KIND_LABEL,
  locationLabel
} from "@/features/events/types/eventItem";
import { googleCalendarUrl } from "@/lib/calendarLink";

export const revalidate = 600;

type Params = { params: { id: string } };

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const event = await getEventById(params.id);
  if (!event) return { title: "イベントが見つかりません" };

  const description =
    event.description?.slice(0, 160) ??
    `${formatDateTime(event.startsAt)} / ${locationLabel(event)}${event.organizer ? ` / 主催: ${event.organizer}` : ""}`;

  return {
    title: event.title,
    description,
    openGraph: {
      type: "article",
      title: event.title,
      description,
      images: event.imageUrl ? [event.imageUrl] : undefined
    },
    twitter: {
      card: event.imageUrl ? "summary_large_image" : "summary",
      title: event.title,
      description,
      images: event.imageUrl ? [event.imageUrl] : undefined
    }
  };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 py-2 text-sm">
      <div className="w-24 shrink-0 text-xs text-muted-foreground">{label}</div>
      <div className="min-w-0 flex-1 text-foreground/90">{value}</div>
    </div>
  );
}

export default async function EventPage({ params }: Params) {
  const event = await getEventById(params.id);
  if (!event) notFound();

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
        ← イベント一覧に戻る
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="yui-pill bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {EVENT_KIND_LABEL[event.kind]}
        </span>
        <span className="yui-pill bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {EVENT_FORMAT_LABEL[event.format]}
        </span>
      </div>

      <h1 className="mt-2 text-2xl font-bold leading-snug tracking-tight">{event.title}</h1>
      {event.organizer && <p className="mt-1.5 text-sm text-muted-foreground">主催: {event.organizer}</p>}

      {event.description && (
        <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
          {event.description}
        </p>
      )}

      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-muted/30 px-4">
        <Row label="開催日時" value={formatDateTime(event.startsAt)} />
        {event.endsAt && <Row label="終了日時" value={formatDateTime(event.endsAt)} />}
        {event.applyDeadline && <Row label="応募締切" value={formatDateTime(event.applyDeadline)} />}
        <Row label="開催地" value={locationLabel(event)} />
        {event.venue && <Row label="会場" value={event.venue} />}
        {event.prize && <Row label="賞金・特典" value={event.prize} />}
        {event.capacity != null && (
          <Row
            label="定員"
            value={event.accepted != null ? `${event.accepted} / ${event.capacity} 人` : `${event.capacity} 人`}
          />
        )}
      </div>

      {event.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {event.tags.map((tag) => (
            <span key={tag} className="yui-pill bg-foreground/[0.04] px-2.5 py-0.5 text-xs text-foreground/80">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-7 flex flex-wrap gap-2">
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[hsl(var(--accent))]/90"
        >
          告知ページを開く
        </a>
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition hover:border-[hsl(var(--accent))]/60"
        >
          📅 Googleカレンダーに追加
        </a>
      </div>
    </main>
  );
}
