"use client";

import { useMemo, useState, Suspense, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/timeline/FilterBar";
import { useFilterState } from "@/hooks/useFilterState";
import { applyFilters } from "@/lib/filters";
import { Calendar } from "@/components/ui/calendar";

import { radarItems } from "../mock/radarItems";
import { CompareDialog } from "./CompareDialog";
import { LeftNav } from "./LeftNav";
import { NewItemsBanner } from "./NewItemsBanner";
import { RadarTable, type SortKey } from "./RadarTable";
import { RightDetailPanel } from "./RightDetailPanel";

const GRID_OPEN = "240px minmax(0, 1fr) 420px";
const GRID_CLOSED = "240px minmax(0, 1fr) 0px";

type ViewMode = "db" | "calendar";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  companyId?: string;
}

function DashboardContent() {
  const { filter, updateFilter, resetFilter, isFiltered } = useFilterState();

  const [viewMode, setViewMode] = useState<ViewMode>("db");
  const [savedOnly, setSavedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(radarItems[0]?.id);
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(radarItems.filter((r) => r.saved).map((r) => r.id))
  );

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

  const selected =
    savedFilteredItems.find((r) => r.id === selectedId) ?? savedFilteredItems[0] ?? filteredItems[0];
  const effectiveSelectedId = selected?.id;

  useEffect(() => {
    const loadCalendarEvents = async () => {
      try {
        const mockEvents: CalendarEvent[] = [
          {
            id: "cal_1",
            title: "説明会: note株式会社",
            startTime: new Date("2026-04-25T10:00:00"),
            endTime: new Date("2026-04-25T11:00:00"),
            location: "オンライン",
            companyId: "r3"
          },
          {
            id: "cal_2",
            title: "早期選考: アクセンチュア株式会社",
            startTime: new Date("2026-04-28T14:00:00"),
            endTime: new Date("2026-04-28T16:00:00"),
            location: "赤坂インターシティAIR",
            companyId: "r2"
          },
          {
            id: "cal_3",
            title: "説明会: 株式会社ディー・エヌ・エー",
            startTime: new Date("2026-04-30T13:00:00"),
            endTime: new Date("2026-04-30T15:00:00"),
            location: "渋谷",
            companyId: "r5"
          }
        ];
        setCalendarEvents(mockEvents);
      } catch (error) {
        console.error("Failed to load calendar events:", error);
      }
    };

    loadCalendarEvents();
  }, []);

  return (
    <div className="h-screen bg-background">
      <div
        className="grid h-full"
        style={{ gridTemplateColumns: isRightOpen ? GRID_OPEN : GRID_CLOSED }}
      >
        <div className="border-r border-border">
          <LeftNav />
        </div>

        <div className="min-w-0">
          <div className="flex h-full flex-col">
            <NewItemsBanner userId={process.env.NEXT_PUBLIC_DEMO_USER_ID} />
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "db" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("db")}
                >
                  メインDB
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "calendar" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("calendar")}
                >
                  カレンダー
                </Button>
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

            <div className="flex h-full min-w-0">
              <div className="flex-1 min-w-0 p-4">
                {viewMode === "calendar" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">Googleカレンダー連携</div>
                        <div className="text-xs text-muted-foreground">メインDBの予定をカレンダーで確認</div>
                      </div>
                    </div>
                    <Calendar
                      events={calendarEvents}
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                    />
                  </div>
                ) : (
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
                      items={savedFilteredItems}
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

        <div
          className="border-l border-border"
          aria-hidden={!isRightOpen}
          style={{ width: isRightOpen ? 420 : 0, overflow: "hidden" }}
        >
          <RightDetailPanel
            item={selected}
            onClose={() => setIsRightOpen(false)}
            isSaved={selected ? savedIds.has(selected.id) : false}
            onToggleSaved={toggleSaved}
          />
        </div>
      </div>
    </div>
  );
}

export function ThreePaneDashboard() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
