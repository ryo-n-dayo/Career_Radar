"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  companyId?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export function Calendar({ events = [], onDateSelect, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      isSameDay(new Date(event.startTime), date)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev =>
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h3 className="text-lg font-semibold">
          {format(currentMonth, 'yyyy年 M月')}
        </h3>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentMonth);

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect?.(date)}
              className={cn(
                "min-h-[80px] p-1 text-left border rounded-md hover:bg-muted/50 transition-colors",
                isSelected && "ring-2 ring-primary",
                !isCurrentMonth && "text-muted-foreground bg-muted/20"
              )}
            >
              <div className="text-sm font-medium mb-1">
                {format(date, 'd')}
              </div>

              {/* Events for this day */}
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <Badge
                    key={event.id}
                    variant="secondary"
                    className="text-xs w-full justify-start truncate"
                  >
                    {event.title}
                  </Badge>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Event List */}
      {selectedDate && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">
            {format(selectedDate, 'M月d日')}のイベント
          </h4>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).map(event => (
              <div key={event.id} className="p-2 border rounded-md bg-muted/20">
                <div className="font-medium text-sm">{event.title}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                  {event.location && ` @ ${event.location}`}
                </div>
              </div>
            ))}
            {getEventsForDate(selectedDate).length === 0 && (
              <div className="text-sm text-muted-foreground">イベントなし</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
