"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { radarItems } from "../mock/radarItems";

type ViewMode = "db" | "calendar" | "news";

type Props = {
  viewMode: ViewMode;
  onChangeView: (mode: ViewMode) => void;
  newsUnread?: number;
};

export function LeftNav({ viewMode, onChangeView, newsUnread = 0 }: Props) {
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
    let within7 = 0;
    for (const r of radarItems) {
      const d = new Date(r.date);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
      if (diff >= 0 && diff <= 7) within7 += 1;
    }
    return { within7, total: radarItems.length };
  }, []);

  const handleGoogleAuth = async () => {
    try {
      const userId = "demo-user-id";
      const response = await fetch(`/api/auth/google?userId=${userId}`);
      const data = await response.json();
      if (data.authUrl) {
        window.open(data.authUrl, "_blank");
      }
    } catch (error) {
      console.error("Google auth error:", error);
    }
  };

  return (
    <nav className="flex h-full flex-col gap-4 p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 px-1 pt-1">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent-2))] text-white shadow-sm">
          <span className="text-sm">◎</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight">Career Radar</div>
          <div className="truncate text-[10px] leading-tight text-muted-foreground">
            DB一覧と企業別フォルダを<br />一元管理します。
          </div>
        </div>
      </div>

      {/* Weekly summary */}
      <div className="rounded-2xl border border-border bg-background/80 p-3 shadow-sm">
        <div className="mb-2 text-[11px] font-semibold text-foreground/80">今週のサマリ</div>
        <div className="flex items-end gap-4">
          <div>
            <div className="text-2xl font-bold leading-none tabular-nums text-[hsl(var(--accent))]">
              {summary.within7}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">7日以内</div>
          </div>
          <div className="ml-auto">
            <div className="text-2xl font-bold leading-none tabular-nums text-foreground/80">
              {summary.total}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">合計</div>
          </div>
        </div>
      </div>

      {/* Navigation: News tab */}
      <div>
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          ナビ
        </div>
        <div className="flex flex-col gap-1.5">
          {(
            [
              { key: "db", label: "📋 メインDB", icon: null },
              { key: "calendar", label: "📅 カレンダー", icon: null },
              { key: "news", label: "📰 今日のニュース", badge: newsUnread },
            ] as Array<{ key: ViewMode; label: string; badge?: number; icon: null }>
          ).map(({ key, label, badge }) => (
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
                <span className={cn(
                  "ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold tabular-nums",
                  viewMode === key
                    ? "bg-white/30 text-white"
                    : "bg-[hsl(var(--accent))] text-white"
                )}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Google */}
      <div>
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Google連携
        </div>
        <button
          onClick={handleGoogleAuth}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm transition hover:border-[hsl(var(--accent))]/50"
        >
          <span className="flex items-center gap-2">
            <span className="text-[13px]">🔗</span>
            <span>Google接続</span>
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </button>
      </div>

      {/* Theme */}
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
    </nav>
  );
}
