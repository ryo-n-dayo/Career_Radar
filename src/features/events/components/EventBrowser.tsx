"use client";

import { useEffect, useMemo, useState, Suspense } from "react";

import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/timeline/FilterBar";
import { useFilterState } from "@/hooks/useFilterState";
import { applyFilters, isExpired } from "@/lib/filters";
import { Calendar, type CalendarEvent } from "@/components/ui/calendar";

import { EVENT_KIND_LABEL, locationLabel, type EventItem } from "../types/eventItem";
import { useSavedEvents } from "../hooks/useSavedEvents";
import { EventList, type SortKey } from "./EventList";
import { EventDetailPanel } from "./EventDetailPanel";
import { LeftNav, type ViewMode } from "./LeftNav";

const GRID_OPEN = "240px minmax(0, 1fr) 600px";
const GRID_CLOSED = "240px minmax(0, 1fr) 0px";

const VIEW_TITLE: Record<ViewMode, string> = {
  list: "イベント一覧",
  calendar: "カレンダー",
  saved: "保存済み"
};

function BrowserContent({ initialEvents }: { initialEvents: EventItem[] }) {
  const { filter, updateFilter, resetFilter, isFiltered } = useFilterState();
  const { savedIds, toggleSaved } = useSavedEvents();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showExpired, setShowExpired] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialEvents[0]?.id);
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  /** 地域フィルタの選択肢は実際に存在する都道府県だけに絞る */
  const availablePrefectures = useMemo(() => {
    const set = new Set<string>();
    for (const event of initialEvents) {
      if (event.prefecture) set.add(event.prefecture);
    }
    return [...set].sort();
  }, [initialEvents]);

  const filtered = useMemo(() => {
    let result = applyFilters(initialEvents, filter);
    if (!showExpired) result = result.filter((event) => !isExpired(event));
    if (viewMode === "saved") result = result.filter((event) => savedIds.has(event.id));
    return result;
  }, [initialEvents, filter, showExpired, viewMode, savedIds]);

  const expiredCount = useMemo(() => initialEvents.filter(isExpired).length, [initialEvents]);

  // 表示中の一覧から選択が外れたら先頭に寄せる
  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(undefined);
      return;
    }
    if (!selectedId || !filtered.some((event) => event.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = useMemo(
    () => initialEvents.find((event) => event.id === selectedId),
    [initialEvents, selectedId]
  );

  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      filtered.map((event) => ({
        id: event.id,
        title: event.title,
        startTime: new Date(event.startsAt),
        endTime: new Date(event.endsAt ?? event.startsAt),
        location: event.venue ?? locationLabel(event),
        category: EVENT_KIND_LABEL[event.kind]
      })),
    [filtered]
  );

  return (
    <div
      className="grid h-screen w-full gap-0 overflow-hidden bg-background transition-[grid-template-columns] duration-300"
      style={{ gridTemplateColumns: isRightOpen ? GRID_OPEN : GRID_CLOSED }}
    >
      {/* 左ペイン */}
      <div className="min-h-0 overflow-y-auto border-r border-border">
        <LeftNav
          viewMode={viewMode}
          onChangeView={setViewMode}
          events={initialEvents}
          savedCount={savedIds.size}
        />
      </div>

      {/* 中央ペイン */}
      <div className="flex min-h-0 min-w-0 flex-col">
        <FilterBar
          filter={filter}
          onUpdate={updateFilter}
          onReset={resetFilter}
          isFiltered={isFiltered}
          availablePrefectures={availablePrefectures}
        />

        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={showExpired}
              onChange={(e) => setShowExpired(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border"
            />
            <span>終了したイベントも表示（{expiredCount}件）</span>
          </label>

          {!isRightOpen && (
            <Button
              variant="outline"
              size="sm"
              className="yui-pill ml-auto"
              onClick={() => setIsRightOpen(true)}
            >
              詳細を開く
            </Button>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
          {viewMode === "calendar" ? (
            <div className="min-h-0 flex-1 overflow-auto pt-3">
              <Calendar
                events={calendarEvents}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>
          ) : (
            <EventList
              items={filtered}
              savedIds={savedIds}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setIsRightOpen(true);
              }}
              sortKey={sortKey}
              onChangeSort={setSortKey}
              onResetFilter={resetFilter}
              title={VIEW_TITLE[viewMode]}
            />
          )}
        </div>
      </div>

      {/* 右ペイン */}
      <div className="min-h-0 overflow-hidden border-l border-border">
        {isRightOpen && (
          <EventDetailPanel
            item={selected}
            onClose={() => setIsRightOpen(false)}
            isSaved={selected ? savedIds.has(selected.id) : false}
            onToggleSaved={toggleSaved}
          />
        )}
      </div>
    </div>
  );
}

export function EventBrowser({ initialEvents }: { initialEvents: EventItem[] }) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">読み込み中...</div>}>
      <BrowserContent initialEvents={initialEvents} />
    </Suspense>
  );
}
