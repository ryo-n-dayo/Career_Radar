"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  EVENT_KIND_LABEL,
  INGEST_SOURCE_LABEL,
  countdownTarget,
  locationLabel,
  type EventItem
} from "@/features/events/types/eventItem";

export function EventAdminList({ events }: { events: EventItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(event: EventItem) {
    if (!window.confirm(`「${event.title}」を削除します。よろしいですか？`)) return;

    setError(null);
    setDeletingId(event.id);
    try {
      const res = await fetch(`/api/admin/events?id=${encodeURIComponent(event.id)}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `削除に失敗しました (${res.status})`);
        return;
      }
      router.refresh();
    } catch {
      setError("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  }

  if (events.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        まだイベントがありません。
      </p>
    );
  }

  return (
    <div className="mt-6">
      {error && (
        <p className="mb-3 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="yui-pill bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {EVENT_KIND_LABEL[event.kind]}
                </span>
                <span className="yui-pill bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-foreground/70">
                  {INGEST_SOURCE_LABEL[event.ingestSource]}
                </span>
              </div>
              <div className="mt-1 truncate text-sm font-medium">{event.title}</div>
              <div className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                {countdownTarget(event).toLocaleDateString("ja-JP")} / {locationLabel(event)}
                {event.organizer ? ` / ${event.organizer}` : ""}
              </div>
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block truncate text-[11px] text-muted-foreground hover:underline"
              >
                {event.url}
              </a>
            </div>

            <div className="flex shrink-0 gap-1.5">
              <a
                href={`/events/${event.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm transition-colors hover:bg-muted"
              >
                表示
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(event)}
                disabled={deletingId === event.id}
              >
                {deletingId === event.id ? "削除中..." : "削除"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
