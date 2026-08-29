"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  /** EVENT_KIND_LABEL の値（「ハッカソン」など）。凡例と色分けに使う。 */
  category?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

const CATEGORY_COLORS: Record<string, string> = {
  "ハッカソン": "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  "コンテスト": "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  "インターン": "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  "勉強会":     "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  "セミナー":   "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
  "その他":     "bg-muted text-muted-foreground",
};

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

/** Google Calendar の「イベント追加」URLを生成（OAuth 不要） */
function buildGoogleCalendarUrl(ev: CalendarEvent): string {
  const start = format(new Date(ev.startTime), "yyyyMMdd");
  const nextDay = new Date(ev.startTime);
  nextDay.setDate(nextDay.getDate() + 1);
  const end = format(nextDay, "yyyyMMdd");
  const title = encodeURIComponent(ev.title);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}%2F${end}`;
}

export function Calendar({ events = [], onDateSelect, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  // 月初の曜日インデックス（0=日〜6=土）分だけ空セルを先頭に挿入
  const startPad = getDay(monthStart);

  const getEventsForDate = (date: Date) =>
    events.filter((e) => isSameDay(new Date(e.startTime), date));

  const navigateMonth = (dir: "prev" | "next") =>
    setCurrentMonth((prev) => (dir === "next" ? addMonths(prev, 1) : subMonths(prev, 1)));

  return (
    <div className="w-full space-y-4">
      {/* ─── ヘッダー ─── */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="yui-pill" onClick={() => navigateMonth("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-base font-semibold">{format(currentMonth, "yyyy年 M月")}</h3>
        <Button variant="outline" size="sm" className="yui-pill" onClick={() => navigateMonth("next")}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* ─── 凡例 ─── */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(CATEGORY_COLORS).map(([cat, cls]) => (
          <span key={cat} className={cn("yui-pill px-2 py-0.5 text-[10px] font-medium", cls)}>
            {cat}
          </span>
        ))}
      </div>

      {/* ─── 曜日ヘッダー ─── */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((day, i) => (
          <div
            key={day}
            className={cn(
              "py-1.5 text-center text-xs font-semibold",
              i === 0 ? "text-rose-500" : i === 6 ? "text-sky-500" : "text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* ─── カレンダーグリッド ─── */}
      <div className="grid grid-cols-7 gap-1">
        {/* 月初パディング */}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[72px] rounded-xl" />
        ))}

        {calendarDays.map((date) => {
          const dayEvents = getEventsForDate(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const today = isToday(date);
          const dow = getDay(date);

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onDateSelect?.(date)}
              className={cn(
                "min-h-[72px] rounded-xl border p-1.5 text-left transition-colors hover:bg-muted/50",
                isSelected
                  ? "border-[hsl(var(--accent))]/60 ring-1 ring-[hsl(var(--accent))]/40"
                  : today
                    ? "border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/5"
                    : "border-border"
              )}
            >
              {/* 日付 */}
              <div
                className={cn(
                  "mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium",
                  today
                    ? "bg-[hsl(var(--accent))] font-bold text-white"
                    : dow === 0
                      ? "text-rose-500"
                      : dow === 6
                        ? "text-sky-500"
                        : "text-foreground/80"
                )}
              >
                {format(date, "d")}
              </div>

              {/* イベントバッジ（最大2件） */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((ev) => {
                  const colorCls = CATEGORY_COLORS[ev.category ?? ""] ?? "bg-muted text-muted-foreground";
                  return (
                    <div
                      key={ev.id}
                      className={cn("w-full truncate rounded px-1 py-0.5 text-[9px] font-medium", colorCls)}
                    >
                      {ev.title}
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <div className="pl-0.5 text-[9px] text-muted-foreground">
                    +{dayEvents.length - 2}件
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── 選択日のイベント一覧 ─── */}
      {selectedDate && (
        <div className="rounded-2xl border border-border bg-background p-4">
          <h4 className="mb-3 text-sm font-semibold">
            {format(selectedDate, "M月d日")}の予定
          </h4>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).map((ev) => {
              const colorCls = CATEGORY_COLORS[ev.category ?? ""] ?? "bg-muted text-muted-foreground";
              return (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3"
                >
                  <span className={cn("yui-pill shrink-0 px-2 py-0.5 text-[10px] font-medium", colorCls)}>
                    {ev.category}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{ev.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {format(new Date(ev.startTime), "yyyy-MM-dd HH:mm")}
                      {ev.location && ` @ ${ev.location}`}
                    </div>
                  </div>
                  <a
                    href={buildGoogleCalendarUrl(ev)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-foreground transition hover:border-[hsl(var(--accent))]/60 hover:bg-[hsl(var(--accent))]/5"
                  >
                    <span>📅</span>
                    <span>追加</span>
                  </a>
                </div>
              );
            })}
            {getEventsForDate(selectedDate).length === 0 && (
              <p className="text-sm text-muted-foreground">予定なし</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
