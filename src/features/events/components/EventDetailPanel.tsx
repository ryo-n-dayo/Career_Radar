"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { buildIcs, googleCalendarUrl, icsFileName } from "@/lib/calendarLink";
import { cn } from "@/lib/utils";

import {
  EVENT_FORMAT_LABEL,
  EVENT_KIND_LABEL,
  INGEST_SOURCE_LABEL,
  countdownTarget,
  locationLabel,
  type EventItem
} from "../types/eventItem";

type Props = {
  item?: EventItem;
  onClose: () => void;
  isSaved: boolean;
  onToggleSaved: (id: string) => void;
};

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

function DeadlineRing({ item }: { item: EventItem }) {
  const size = 72;
  const target = countdownTarget(item);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  const max = 30;
  const clamped = Math.max(0, Math.min(diff, max));
  const pct = 1 - clamped / max;
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  const urgent = diff <= 3;
  const stroke = urgent ? "hsl(0 70% 55%)" : "hsl(var(--accent))";
  const label = diff === 0 ? "本日" : diff > 0 ? `あと${diff}日` : `${Math.abs(diff)}日経過`;
  const caption = item.applyDeadline ? "応募締切まで" : "開催まで";

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={4} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={stroke}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="mt-0.5 text-lg font-bold tabular-nums" style={{ color: stroke }}>
            {Math.max(0, diff)}
          </span>
          <span className="text-[9px] text-muted-foreground">日</span>
        </div>
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground">{caption}</div>
        <div className="text-base font-bold" style={{ color: stroke }}>
          {label}
        </div>
        <div className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
          {new Date(item.applyDeadline ?? item.startsAt).toLocaleDateString("ja-JP")}
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5 text-sm">
      <div className="w-20 shrink-0 text-xs text-muted-foreground">{label}</div>
      <div className="min-w-0 flex-1 text-foreground/90">{value}</div>
    </div>
  );
}

function Section({
  title,
  children,
  delay = 0
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="yui-row rounded-2xl border border-border bg-background p-4"
      style={{ ["--yui-delay" as string]: `${delay}s` }}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="h-3 w-[3px] rounded-full bg-foreground/60" />
        <h4 className="yui-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
      </div>
      {children}
    </section>
  );
}

/** .ics をその場で Blob 化してダウンロードさせる（サーバー往復なし） */
function downloadIcs(item: EventItem) {
  const blob = new Blob([buildIcs(item)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = icsFileName(item);
  anchor.click();
  URL.revokeObjectURL(url);
}

export function EventDetailPanel({ item, onClose, isSaved, onToggleSaved }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [item?.id]);

  return (
    <aside className="flex h-full flex-col bg-muted/20">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="text-sm font-semibold tracking-tight">詳細</div>
        <div className="ml-auto flex items-center gap-1.5">
          {item && (
            <a
              href={`/events/${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="yui-pill inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              個別ページ
            </a>
          )}
          <Button variant="ghost" size="sm" className="yui-pill" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </div>

      <Separator />

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto p-4">
        {!item ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center text-sm text-muted-foreground">
            左のカードから選択してください
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Hero */}
            <div
              className="yui-row rounded-2xl border border-border bg-background p-4"
              style={{ ["--yui-delay" as string]: "0s" }}
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <span className="yui-pill bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {EVENT_KIND_LABEL[item.kind]}
                </span>
                <span className="yui-pill bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {EVENT_FORMAT_LABEL[item.format]}
                </span>
                <span className="yui-pill bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-foreground/70">
                  {INGEST_SOURCE_LABEL[item.ingestSource]}
                </span>
              </div>

              <h2 className="text-lg font-semibold leading-snug tracking-tight">{item.title}</h2>
              {item.organizer && (
                <p className="mt-1 text-sm text-muted-foreground">主催: {item.organizer}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <DeadlineRing item={item} />

                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <a
                    href={googleCalendarUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium shadow-sm transition",
                      "border border-border bg-background text-foreground",
                      "hover:border-[hsl(var(--accent))]/60 hover:bg-[hsl(var(--accent))]/5"
                    )}
                  >
                    <span>📅</span>
                    <span>Googleカレンダーに追加</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => downloadIcs(item)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-[hsl(var(--accent))]/50"
                  >
                    <span>⬇</span>
                    <span>.ics</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleSaved(item.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition",
                      isSaved
                        ? "bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent))]/90"
                        : "border border-border bg-background text-foreground hover:border-[hsl(var(--accent))]/50"
                    )}
                  >
                    <span>{isSaved ? "★" : "☆"}</span>
                    <span>{isSaved ? "保存済み" : "保存する"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 概要 */}
            {item.description && (
              <Section title="概要" delay={0.05}>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                  {item.description}
                </p>
              </Section>
            )}

            {/* 開催情報 */}
            <Section title="開催情報" delay={0.1}>
              <div className="divide-y divide-border rounded-xl border border-border bg-muted/30 px-3">
                <DataRow label="開催日時" value={formatDateTime(item.startsAt)} />
                {item.endsAt && <DataRow label="終了日時" value={formatDateTime(item.endsAt)} />}
                {item.applyDeadline && <DataRow label="応募締切" value={formatDateTime(item.applyDeadline)} />}
                <DataRow label="開催形式" value={EVENT_FORMAT_LABEL[item.format]} />
                <DataRow label="開催地" value={locationLabel(item)} />
                {item.venue && <DataRow label="会場" value={item.venue} />}
                {item.capacity != null && (
                  <DataRow
                    label="定員"
                    value={item.accepted != null ? `${item.accepted} / ${item.capacity} 人` : `${item.capacity} 人`}
                  />
                )}
              </div>
            </Section>

            {/* 賞金・特典 */}
            {item.prize && (
              <Section title="賞金・特典" delay={0.14}>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{item.prize}</p>
              </Section>
            )}

            {/* タグ */}
            {item.tags.length > 0 && (
              <Section title="タグ" delay={0.18}>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="yui-pill bg-foreground/[0.04] px-2.5 py-0.5 text-xs text-foreground/80"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* 主催者・元ページ */}
            <Section title="リンク" delay={0.22}>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <span className="yui-pill bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                      告知ページ
                    </span>
                    <span className="truncate text-foreground/80">{item.url}</span>
                  </a>
                </li>
                {item.organizerUrl && (
                  <li>
                    <a
                      href={item.organizerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <span className="yui-pill bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        主催者
                      </span>
                      <span className="truncate text-foreground/80">{item.organizerUrl}</span>
                    </a>
                  </li>
                )}
              </ul>
            </Section>
          </div>
        )}
      </div>
    </aside>
  );
}
