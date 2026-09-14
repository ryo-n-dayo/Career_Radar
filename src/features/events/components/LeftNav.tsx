"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/appConfig";
import { countdownTarget, type EventItem } from "../types/eventItem";

export type ViewMode = "list" | "calendar" | "saved";

type Props = {
  viewMode: ViewMode;
  onChangeView: (mode: ViewMode) => void;
  events: EventItem[];
  savedCount: number;
};

export function LeftNav({ viewMode, onChangeView, events, savedCount }: Props) {
  const [isDark, setIsDark] = useState(false);

  const initial = useMemo(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  }, []);

  useEffect(() => {
    setIsDark(initial);
  }, [initial]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let closingSoon = 0;
    let thisWeek = 0;

    for (const event of events) {
      const deadline = countdownTarget(event);
      deadline.setHours(0, 0, 0, 0);
      const deadlineDiff = Math.round((deadline.getTime() - today.getTime()) / 86400000);
      if (deadlineDiff >= 0 && deadlineDiff <= 7) closingSoon += 1;

      const start = new Date(event.startsAt);
      start.setHours(0, 0, 0, 0);
      const startDiff = Math.round((start.getTime() - today.getTime()) / 86400000);
      if (startDiff >= 0 && startDiff <= 7) thisWeek += 1;
    }

    return { closingSoon, thisWeek, total: events.length };
  }, [events]);

  const navItems: Array<{ key: ViewMode; label: string; badge?: number }> = [
    { key: "list", label: "📋 イベント一覧" },
    { key: "calendar", label: "📅 カレンダー" },
    { key: "saved", label: "★ 保存済み", badge: savedCount }
  ];

  return (
    <nav className="flex h-full flex-col gap-4 p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 px-1 pt-1">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent-2))] text-white shadow-sm">
          <span className="text-sm">◎</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight">{APP_NAME}</div>
          <div className="truncate text-[10px] leading-tight text-muted-foreground">
            X・企業・イベントを
            <br />
            一箇所で整理。
          </div>
        </div>
      </div>

      {/* サマリ */}
      <div className="rounded-2xl border border-border bg-background/80 p-3 shadow-sm">
        <div className="mb-2 text-[11px] font-semibold text-foreground/80">今週のサマリ</div>
        <div className="flex items-end gap-3">
          <div>
            <div className="text-2xl font-bold leading-none tabular-nums text-[hsl(var(--accent))]">
              {summary.closingSoon}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">7日以内に締切</div>
          </div>
          <div>
            <div className="text-2xl font-bold leading-none tabular-nums text-foreground/80">
              {summary.thisWeek}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">今週開催</div>
          </div>
          <div className="ml-auto">
            <div className="text-2xl font-bold leading-none tabular-nums text-foreground/80">
              {summary.total}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">掲載</div>
          </div>
        </div>
      </div>

      {/* ナビ */}
      <div>
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          ナビ
        </div>
        <div className="flex flex-col gap-1.5">
          <Link href="/" className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-[hsl(var(--accent))]/40">⌂ ホーム</Link>
          <Link href="/posts" className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-[hsl(var(--accent))]/40">𝕏 投稿</Link>
          <Link href="/companies" className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-[hsl(var(--accent))]/40">▦ 企業</Link>
          {navItems.map(({ key, label, badge }) => (
            <button
              key={key}
              type="button"
              onClick={() => onChangeView(key)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
                viewMode === key
                  ? "bg-[hsl(var(--accent))] text-white shadow-sm"
                  : "border border-border bg-background text-foreground hover:border-[hsl(var(--accent))]/40"
              )}
            >
              <span>{label}</span>
              {badge != null && badge > 0 && (
                <span
                  className={cn(
                    "ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold tabular-nums",
                    viewMode === key ? "bg-white/30 text-white" : "bg-[hsl(var(--accent))] text-white"
                  )}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
          <Link href="/admin" className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-[hsl(var(--accent))]/40">✎ イベント編集</Link>
        </div>
      </div>

      {/* テーマ */}
      <div>
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          テーマ
        </div>
        <Button
          onClick={() => setIsDark((v) => !v)}
          className="w-full justify-start gap-2 rounded-xl bg-[hsl(var(--accent))] text-white shadow-sm hover:bg-[hsl(var(--accent))]/90"
        >
          <span>{isDark ? "🌙" : "☀️"}</span>
          <span>{isDark ? "ダーク" : "ライト"}</span>
        </Button>
      </div>

      {/* Legal */}
      <div className="mt-auto flex gap-3 px-1 text-[11px] text-muted-foreground">
        <a href="/privacy" className="transition-colors hover:text-foreground">
          プライバシー
        </a>
        <a href="/terms" className="transition-colors hover:text-foreground">
          利用規約
        </a>
      </div>
    </nav>
  );
}
