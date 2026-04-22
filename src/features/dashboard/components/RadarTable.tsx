"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SourceList } from "@/components/timeline/SourceList";

import type { RadarItem } from "../types/radarItem";

export type SortKey = "deadline" | "ai";

type Props = {
  items: RadarItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  sortKey: SortKey;
  onChangeSort: (key: SortKey) => void;
  onResetFilter: () => void;
};

function deadlineAccent(label: RadarItem["deadlineLabel"]) {
  switch (label) {
    case "締切":
      return "bg-foreground text-background";
    case "早期選考":
      return "bg-foreground/80 text-background";
    case "説明会":
      return "bg-foreground/60 text-background";
  }
}

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

function HeatBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className="yui-bar h-full rounded-full bg-foreground"
          style={{ ["--scale" as string]: pct / 100, width: "100%" }}
        />
      </div>
      <span className="tabular-nums text-xs font-medium text-foreground/80">{pct}</span>
    </div>
  );
}

export function RadarTable({
  items,
  selectedId,
  onSelect,
  sortKey,
  onChangeSort,
  onResetFilter
}: Props) {
  const sorted = useMemo(() => {
    const copy = [...items];
    if (sortKey === "deadline") {
      copy.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      copy.sort((a, b) => b.aiHeat - a.aiHeat);
    }
    return copy;
  }, [items, sortKey]);

  return (
    <section className="flex h-full min-w-0 flex-col">
      <div className="flex items-center gap-3 px-1 py-2">
        <div className="text-sm font-semibold tracking-tight">メインDB</div>
        <div className="text-xs text-muted-foreground">{sorted.length}件</div>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-border bg-muted/40 p-0.5">
          <button
            type="button"
            onClick={() => onChangeSort("deadline")}
            className={cn(
              "yui-pill px-3 py-1 text-xs font-medium transition-colors",
              sortKey === "deadline"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            締切順
          </button>
          <button
            type="button"
            onClick={() => onChangeSort("ai")}
            className={cn(
              "yui-pill px-3 py-1 text-xs font-medium transition-colors",
              sortKey === "ai"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            AI熱量順
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <ul className="flex flex-col gap-2 pb-4">
          {sorted.map((row, idx) => {
            const d = daysUntil(row.date);
            const urgent = d.days >= 0 && d.days <= 7;
            const isSelected = row.id === selectedId;
            return (
              <li
                key={row.id}
                className="yui-row"
                style={{ ["--yui-delay" as string]: `${Math.min(idx, 10) * 0.035}s` }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(row.id)}
                  className={cn(
                    "yui-card block w-full rounded-2xl border bg-background px-4 py-3 text-left",
                    isSelected
                      ? "border-foreground/40 shadow-sm"
                      : "border-border hover:border-foreground/20"
                  )}
                >
                  {/* Row 1: company name + trust + category */}
                  <div className="flex items-baseline gap-2">
                    <h3 className="truncate text-base font-semibold tracking-tight">
                      {row.companyName}
                    </h3>
                    <span
                      className={cn(
                        "yui-pill shrink-0 px-2 py-0.5 text-[10px] font-medium",
                        row.trust === "official"
                          ? "bg-foreground/5 text-foreground/70"
                          : "bg-amber-100/60 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                      )}
                    >
                      {row.trust === "official" ? "公式認証" : "要確認"}
                    </span>
                    <span className="yui-pill ml-auto shrink-0 bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {row.category}
                    </span>
                  </div>

                  {/* Row 2: content */}
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/80">
                    {row.content}
                  </p>

                  {/* Row 3: meta grid */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "yui-pill px-2 py-0.5 text-[10px] font-semibold",
                          deadlineAccent(row.deadlineLabel)
                        )}
                      >
                        {row.deadlineLabel}
                      </span>
                      <span className="tabular-nums text-muted-foreground">{row.date}</span>
                      <span
                        className={cn(
                          "yui-pill px-2 py-0.5 text-[10px] tabular-nums",
                          urgent
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {urgent && <span className="yui-dot mr-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-500 align-middle" />}
                        {d.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        熱量
                      </span>
                      <HeatBar value={row.aiHeat} />
                    </div>

                    <div className="ml-auto">
                      <SourceList sources={row.sources} size="sm" maxDisplay={3} />
                    </div>
                  </div>

                  {/* Row 4: keyword pills */}
                  {row.keywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {row.keywords.map((k) => (
                        <span
                          key={k}
                          className="yui-pill bg-foreground/[0.04] px-2 py-0.5 text-[11px] text-foreground/70"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              </li>
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
