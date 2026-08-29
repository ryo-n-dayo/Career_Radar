"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";

import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/timeline/FilterBar";
import { useFilterState } from "@/hooks/useFilterState";
import { applyFilters, isExpired } from "@/lib/filters";
import { Calendar, type CalendarEvent } from "@/components/ui/calendar";

import type { RadarItem } from "../types/radarItem";
import { CompareDialog } from "./CompareDialog";
import { LeftNav } from "./LeftNav";
import { NewItemsBanner } from "./NewItemsBanner";
import { RadarTable, type SortKey } from "./RadarTable";
import { RightDetailPanel } from "./RightDetailPanel";
import { NewsPanel } from "@/features/news/NewsPanel";
import { SelfPRLibraryPanel } from "./SelfPRLibraryPanel";
import { MyPageListPanel } from "./MyPageListPanel";

const GRID_OPEN = "240px minmax(0, 1fr) 600px";
const GRID_CLOSED = "240px minmax(0, 1fr) 0px";

type ViewMode = "db" | "calendar" | "news" | "expired" | "selfpr" | "mypage";

type CalendarAddedEntry = { eventId: string; htmlLink: string };

function loadCalendarAddedMap(): Record<string, CalendarAddedEntry> {
  try {
    return JSON.parse(localStorage.getItem("calendar_added") ?? "{}");
  } catch {
    return {};
  }
}

function DashboardContent({ initialItems }: { initialItems: RadarItem[] }) {
  const radarItems = initialItems;
  const { filter, updateFilter, resetFilter, isFiltered } = useFilterState();

  // ─── View / UI State ───
  const [viewMode, setViewMode] = useState<ViewMode>("db");
  const [newsUnread, setNewsUnread] = useState(0);
  const [savedOnly, setSavedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(radarItems[0]?.id);
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(radarItems.filter((r) => r.saved).map((r) => r.id))
  );

  // ─── Calendar State ───
  const [calendarAddedMap, setCalendarAddedMap] = useState<Record<string, CalendarAddedEntry>>(
    loadCalendarAddedMap
  );
  const [addingCalendarId, setAddingCalendarId] = useState<string | null>(null);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isCalendarSyncing, setIsCalendarSyncing] = useState(false);

  // ─── ニュース未読カウント ───
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/news/list?limit=1", { signal: controller.signal })
      .then((r) => r.json())
      .then((d: { unreadCount: number }) => setNewsUnread(d.unreadCount ?? 0))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // ─── Google Calendar 同期（カレンダービュー切替時） ───
  useEffect(() => {
    if (viewMode !== "calendar") return;
    const userId = process.env.NEXT_PUBLIC_DEMO_USER_ID;
    if (!userId) return;

    setIsCalendarSyncing(true);
    fetch(`/api/calendar/sync?userId=${userId}`)
      .then((r) => r.json())
      .then((data: { events?: Array<{ title: string; startTime: string; endTime: string; location?: string; googleEventId: string }> }) => {
        if (!data.events) return;
        const mapped: CalendarEvent[] = data.events.map((e) => ({
          id: e.googleEventId,
          title: e.title,
          startTime: new Date(e.startTime),
          endTime: new Date(e.endTime),
          location: e.location,
          isFromGoogle: true,
        }));
        setGoogleCalendarEvents(mapped);
      })
      .catch(() => {})
      .finally(() => setIsCalendarSyncing(false));
  }, [viewMode]);

  // ─── Saved / Filter ───
  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const itemsWithSaved = useMemo(
    () => radarItems.map((r) => ({ ...r, saved: savedIds.has(r.id) })),
    [savedIds]
  );

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredItems = useMemo(
    () => applyFilters(itemsWithSaved, filter),
    [itemsWithSaved, filter]
  );
  const savedFilteredItems = useMemo(
    () => (savedOnly ? filteredItems.filter((item) => item.saved) : filteredItems),
    [filteredItems, savedOnly]
  );

  const activeItems = useMemo(
    () => savedFilteredItems.filter((item) => !isExpired(item.date)),
    [savedFilteredItems]
  );
  const expiredItems = useMemo(
    () => savedFilteredItems.filter((item) => isExpired(item.date)),
    [savedFilteredItems]
  );

  const selected =
    savedFilteredItems.find((r) => r.id === selectedId) ?? savedFilteredItems[0] ?? filteredItems[0];
  const effectiveSelectedId = selected?.id;

  // ─── RadarItems → CalendarEvents 変換（savedFilteredItems 依存） ───
  const radarCalendarEvents = useMemo<CalendarEvent[]>(
    () =>
      savedFilteredItems.map((item) => ({
        id: item.id,
        title: item.companyName,
        startTime: new Date(item.date),
        endTime: new Date(item.date),
        companyId: item.id,
        category: item.category,
        isFromGoogle: false,
      })),
    [savedFilteredItems]
  );

  const mergedCalendarEvents = useMemo(
    () => [...radarCalendarEvents, ...googleCalendarEvents],
    [radarCalendarEvents, googleCalendarEvents]
  );

  // ─── カレンダーに追加 ───
  const handleAddToCalendar = useCallback(
    async (item: RadarItem) => {
      setAddingCalendarId(item.id);
      try {
        const userId = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-user-id";
        const res = await fetch("/api/calendar/add-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            title: `${item.category}: ${item.companyName}`,
            description: item.content,
            date: item.date,
            category: item.category,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as CalendarAddedEntry;
          setCalendarAddedMap((prev) => {
            const next = { ...prev, [item.id]: data };
            localStorage.setItem("calendar_added", JSON.stringify(next));
            return next;
          });
        } else if (res.status === 401) {
          alert("Google連携が必要です。左メニューの「Google接続」から連携してください。");
        }
      } catch {
        alert("カレンダーへの追加に失敗しました。");
      } finally {
        setAddingCalendarId(null);
      }
    },
    []
  );

  return (
    <div className="h-screen overflow-auto bg-background">
      <div
        className="grid h-full min-w-[820px]"
        style={{ gridTemplateColumns: isRightOpen ? GRID_OPEN : GRID_CLOSED }}
      >
        {/* ─── Left Nav ─── */}
        <div className="border-r border-border">
          <LeftNav
            viewMode={viewMode}
            onChangeView={setViewMode}
            newsUnread={newsUnread}
            items={radarItems}
          />
        </div>

        {/* ─── Center ─── */}
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="flex h-full flex-col">
            <NewItemsBanner userId={process.env.NEXT_PUBLIC_DEMO_USER_ID} />

            {/* ツールバー */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
              <div className="text-sm font-semibold tracking-tight text-foreground">
                {viewMode === "db" && "メインDB"}
                {viewMode === "calendar" && "カレンダー"}
                {viewMode === "news" && "📰 今日のニュース"}
                {viewMode === "expired" && "⏰ 期限切れ"}
                {viewMode === "selfpr" && "📝 自己PRライブラリ"}
                {viewMode === "mypage" && "🔑 マイページ管理"}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  size="sm"
                  variant={compareMode ? "default" : "outline"}
                  onClick={() => {
                    setCompareMode((v) => {
                      if (v) setCompareIds(new Set());
                      return !v;
                    });
                  }}
                >
                  {compareMode ? `比較選択中 (${compareIds.size})` : "比較モード"}
                </Button>
                {compareMode && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={compareIds.size < 2}
                    onClick={() => setIsCompareOpen(true)}
                  >
                    比較を表示
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={savedOnly ? "secondary" : "ghost"}
                  onClick={() => setSavedOnly(false)}
                >
                  全て
                </Button>
                <Button
                  size="sm"
                  variant={savedOnly ? "ghost" : "outline"}
                  onClick={() => setSavedOnly(true)}
                >
                  保存済み
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRightOpen((v) => !v)}
                >
                  {isRightOpen ? "右パネルを閉じる" : "右パネルを開く"}
                </Button>
              </div>
            </div>

            {/* メインコンテンツ */}
            <div className="flex flex-1 min-h-0 overflow-hidden min-w-0">
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden min-w-0 p-4">

                {/* ─── カレンダービュー ─── */}
                {viewMode === "calendar" ? (
                  <div className="flex flex-1 min-h-0 flex-col overflow-auto">
                    <div className="mb-4 flex items-center gap-3">
                      <div>
                        <div className="text-sm font-semibold">カレンダー</div>
                        <div className="text-xs text-muted-foreground">
                          メインDB の締切日 + Google カレンダーを統合表示
                        </div>
                      </div>
                      {isCalendarSyncing && (
                        <span className="ml-auto text-xs text-muted-foreground animate-pulse">
                          Google カレンダー同期中…
                        </span>
                      )}
                      {!isCalendarSyncing && googleCalendarEvents.length > 0 && (
                        <span className="ml-auto yui-pill bg-blue-50 px-2 py-0.5 text-[11px] text-blue-600">
                          ✓ Google {googleCalendarEvents.length}件同期済み
                        </span>
                      )}
                    </div>
                    <Calendar
                      events={mergedCalendarEvents}
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                    />
                  </div>

                ) : viewMode === "news" ? (
                  <NewsPanel />

                ) : viewMode === "selfpr" ? (
                  <SelfPRLibraryPanel />

                ) : viewMode === "mypage" ? (
                  <MyPageListPanel items={itemsWithSaved} />

                ) : viewMode === "expired" ? (
                  /* ─── 期限切れ ─── */
                  <>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        締切・開催日を過ぎた情報（{expiredItems.length}件）
                      </div>
                    </div>

                    <FilterBar
                      filter={filter}
                      onUpdate={updateFilter}
                      onReset={resetFilter}
                      isFiltered={isFiltered}
                    />

                    <RadarTable
                      title="期限切れ"
                      items={expiredItems}
                      selectedId={effectiveSelectedId}
                      onSelect={(id) => {
                        setSelectedId(id);
                        setIsRightOpen(true);
                      }}
                      sortKey={sortKey}
                      onChangeSort={setSortKey}
                      onResetFilter={resetFilter}
                      compareMode={compareMode}
                      compareSelected={compareIds}
                      onToggleCompare={toggleCompare}
                    />
                  </>
                ) : (
                  /* ─── メインDB ─── */
                  <>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <div className="text-xs text-muted-foreground">保存済みのみ表示: </div>
                      <div className="text-sm font-medium">
                        {savedOnly ? "保存済み" : "全て"}
                      </div>
                    </div>

                    <FilterBar
                      filter={filter}
                      onUpdate={updateFilter}
                      onReset={resetFilter}
                      isFiltered={isFiltered}
                    />

                    <RadarTable
                      items={activeItems}
                      selectedId={effectiveSelectedId}
                      onSelect={(id) => {
                        setSelectedId(id);
                        setIsRightOpen(true);
                      }}
                      sortKey={sortKey}
                      onChangeSort={setSortKey}
                      onResetFilter={resetFilter}
                      compareMode={compareMode}
                      compareSelected={compareIds}
                      onToggleCompare={toggleCompare}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Detail Panel ─── */}
        <div
          className="border-l border-border"
          aria-hidden={!isRightOpen || viewMode === "news"}
          style={{ width: (isRightOpen && viewMode !== "news") ? 600 : 0, overflow: "hidden" }}
        >
          <RightDetailPanel
            item={selected}
            onClose={() => setIsRightOpen(false)}
            isSaved={selected ? savedIds.has(selected.id) : false}
            onToggleSaved={toggleSaved}
          />
        </div>
      </div>

      {isCompareOpen && (
        <CompareDialog
          onClose={() => setIsCompareOpen(false)}
          items={itemsWithSaved.filter((r) => compareIds.has(r.id))}
          onRemove={(id) => setCompareIds((prev) => { const next = new Set(prev); next.delete(id); return next; })}
        />
      )}
    </div>
  );
}

export function ThreePaneDashboard({ initialItems }: { initialItems: RadarItem[] }) {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      }
    >
      <DashboardContent initialItems={initialItems} />
    </Suspense>
  );
}
