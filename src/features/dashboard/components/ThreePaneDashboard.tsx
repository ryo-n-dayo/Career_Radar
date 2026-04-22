"use client";

import { useMemo, useState, Suspense, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/timeline/FilterBar";
import { useFilterState } from "@/hooks/useFilterState";
import { applyFilters } from "@/lib/filters";
import { Calendar } from "@/components/ui/calendar";

import { radarItems } from "../mock/radarItems";
import { LeftNav } from "./LeftNav";
import { NewItemsBanner } from "./NewItemsBanner";
import { RadarTable, type SortKey } from "./RadarTable";
import { RightDetailPanel } from "./RightDetailPanel";

const GRID_OPEN = "240px minmax(1fr, 900px) 420px";
const GRID_CLOSED = "240px minmax(1fr, 900px) 0px";

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

  const filteredItems = useMemo(() => applyFilters(radarItems, filter), [filter]);
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
            title: "面接: 株式会社サンプルテック",
            startTime: new Date("2026-04-25T10:00:00"),
            endTime: new Date("2026-04-25T11:00:00"),
            location: "オンライン",
            companyId: "r1"
          },
          {
            id: "cal_2",
            title: "説明会: Example Consulting",
            startTime: new Date("2026-04-28T14:00:00"),
            endTime: new Date("2026-04-28T16:00:00"),
            location: "東京オフィス",
            companyId: "r2"
          },
          {
            id: "cal_3",
            title: "オフライン説明会: Green Mobility",
            startTime: new Date("2026-04-30T13:00:00"),
            endTime: new Date("2026-04-30T15:00:00"),
            location: "渋谷"
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
          <RightDetailPanel item={selected} onClose={() => setIsRightOpen(false)} />
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
