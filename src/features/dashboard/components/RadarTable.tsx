"use client";

import { Fragment, useEffect, useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { RadarItem } from "../types/radarItem";

export type SortKey = "deadline";

type Props = {
  items: RadarItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  sortKey: SortKey;
  onChangeSort: (key: SortKey) => void;
  onResetFilter: () => void;
  compareMode?: boolean;
  compareSelected?: Set<string>;
  onToggleCompare?: (id: string) => void;
  title?: string;
};

function daysUntil(dateStr: string): { days: number; label: string } {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return { days: 0, label: "本日" };
  if (diff > 0) return { days: diff, label: `あと${diff}日` };
  return { days: diff, label: `${Math.abs(diff)}日経過` };
}

const AVATAR_COLORS = [
  "bg-orange-100 text-orange-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700"
];

function avatarColor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function CountdownRing({ days, size = 52 }: { days: number; size?: number }) {
  const max = 30;
  const clamped = Math.max(0, Math.min(days, max));
  const pct = 1 - clamped / max;
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  const urgent = days <= 3;
  const mid = days <= 7;
  const stroke = urgent ? "hsl(0 70% 55%)" : mid ? "hsl(var(--accent))" : "hsl(var(--accent) / 0.55)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="hsl(var(--muted))"
          strokeWidth={3}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={stroke}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-base font-bold tabular-nums" style={{ color: stroke }}>
          {days < 0 ? 0 : days}
        </span>
        <span className="mt-0.5 text-[8px] text-muted-foreground">日</span>
      </div>
    </div>
  );
}

export function RadarTable({
  items,
  selectedId,
  onSelect,
  sortKey,
  onChangeSort,
  onResetFilter,
  compareMode = false,
  compareSelected,
  onToggleCompare,
  title = "メインDB"
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selectedId]);

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => a.date.localeCompare(b.date));
    if (selectedId) {
      const idx = copy.findIndex((i) => i.id === selectedId);
      if (idx > 0) {
        const [pinned] = copy.splice(idx, 1);
        copy.unshift(pinned);
      }
    }
    return copy;
  }, [items, sortKey, selectedId]);

  return (
    <section className="flex flex-1 min-h-0 min-w-0 flex-col">
      <div className="flex items-center gap-3 px-1 py-2">
        <div className="text-sm font-semibold tracking-tight">{title}</div>
        <div className="text-xs text-muted-foreground">{sorted.length}件</div>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-border bg-background p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => onChangeSort("deadline")}
            className={cn(
              "yui-pill px-3 py-1 text-xs font-medium transition-colors",
              sortKey === "deadline"
                ? "bg-[hsl(var(--accent))] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            新規追加
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
        <ul className="flex flex-col gap-3 pb-4 pr-1">
          {sorted.map((row, idx) => {
            const d = daysUntil(row.date);
            const urgent = d.days >= 0 && d.days <= 3;
            const mid = d.days >= 0 && d.days <= 7;
            const isSelected = row.id === selectedId;
            const isPinned = isSelected && idx === 0 && sorted.length > 1;
            const isChecked = compareSelected?.has(row.id) ?? false;
            const avatar = avatarColor(row.companyName);
            const initial = row.companyName.charAt(0);
            const barColor = urgent
              ? "bg-rose-500"
              : mid
                ? "bg-[hsl(var(--accent))]"
                : "bg-[hsl(var(--accent))]/50";
            const progressPct = Math.max(10, Math.min(100, 100 - (d.days / 30) * 100));
            return (
              <Fragment key={row.id}>
              <li
                className="yui-row"
                style={{ ["--yui-delay" as string]: `${Math.min(idx, 10) * 0.035}s` }}
              >
                <button
                  type="button"
                  data-selected={isSelected && !compareMode ? "true" : undefined}
                  onClick={() =>
                    compareMode ? onToggleCompare?.(row.id) : onSelect(row.id)
                  }
                  className={cn(
                    "yui-card group relative block w-full overflow-hidden rounded-2xl border bg-background px-4 py-4 pr-5 text-left",
                    compareMode && isChecked
                      ? "border-[hsl(var(--accent))]/70 shadow-sm ring-1 ring-[hsl(var(--accent))]/40"
                      : isSelected && !compareMode
                        ? "border-[hsl(var(--accent))]/60 shadow-sm"
                        : "border-border hover:border-[hsl(var(--accent))]/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {compareMode && (
                      <span
                        aria-hidden
                        className={cn(
                          "mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border text-[10px]",
                          isChecked
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background"
                        )}
                      >
                        {isChecked ? "✓" : ""}
                      </span>
                    )}

                    {/* Avatar */}
                    <div
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-base font-bold",
                        row.isJoint
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                          : avatar
                      )}
                    >
                      {row.isJoint ? "複" : initial}
                    </div>

                    {/* Middle */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[15px] font-semibold tracking-tight">
                          {row.companyName}
                        </h3>
                        {row.isJoint && row.participants && (
                          <span className="yui-pill shrink-0 bg-violet-100/80 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                            {row.participants.length}社
                          </span>
                        )}
                        <span
                          className={cn(
                            "yui-pill shrink-0 px-1.5 py-0.5 text-[10px] font-medium",
                            row.trust === "official"
                              ? "bg-foreground/5 text-foreground/70"
                              : "bg-amber-100/60 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                          )}
                        >
                          {row.trust === "official" ? "公式確認" : "要確認"}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-1 text-sm text-foreground/80">
                        {row.content}
                      </p>

                      {/* Meta chips */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="yui-pill inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 text-[10px] text-foreground/70">
                          <span>📅</span>
                          <span className="tabular-nums">{row.date}</span>
                        </span>
                        <span
                          className={cn(
                            "yui-pill inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tabular-nums",
                            urgent
                              ? "bg-rose-100 text-rose-700"
                              : mid
                                ? "bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))]"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                          {d.label}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", barColor)}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Tag chips */}
                      {row.keywords.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {row.keywords.slice(0, 4).map((k) => (
                            <span
                              key={k}
                              className="yui-pill bg-foreground/[0.04] px-2 py-0.5 text-[10px] text-foreground/70"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right col: category + bookmark + ring */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {row.category}
                        </span>
                        <span
                          className={cn(
                            "text-sm",
                            row.saved ? "text-[hsl(var(--accent))]" : "text-muted-foreground/50"
                          )}
                          aria-hidden
                        >
                          {row.saved ? "★" : "☆"}
                        </span>
                      </div>
                      <CountdownRing days={d.days} />
                    </div>
                  </div>
                </button>
              </li>
              {isPinned && (
                <li className="flex items-center gap-2 px-1 py-0.5" aria-hidden>
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-[10px] text-muted-foreground/60">選択中</span>
                  <div className="h-px flex-1 bg-border/60" />
                </li>
              )}
              </Fragment>
            );
          })}

          {sorted.length === 0 && (
            <li className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 text-3xl opacity-40">□</div>
              <div className="mb-4 text-sm text-muted-foreground">
                条件に一致する情報が見つかりませんでした
              </div>
              <Button variant="outline" size="sm" onClick={onResetFilter} className="yui-pill">
                フィルタをリセット
              </Button>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
