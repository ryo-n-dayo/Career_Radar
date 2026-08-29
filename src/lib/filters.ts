import { FilterState } from '@/types/filter';
import { countdownTarget, type EventItem } from '@/features/events/types/eventItem';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export function applyFilters(events: EventItem[], filter: FilterState): EventItem[] {
  const keyword = filter.keyword.toLowerCase();

  return events.filter(event => {
    if (filter.dateFrom || filter.dateTo) {
      const eventDate = new Date(event.startsAt);
      if (filter.dateFrom && eventDate < filter.dateFrom) return false;
      if (filter.dateTo && eventDate > filter.dateTo) return false;
    }

    if (filter.kinds.length > 0 && !filter.kinds.includes(event.kind)) {
      return false;
    }

    if (filter.formats.length > 0 && !filter.formats.includes(event.format)) {
      return false;
    }

    if (filter.prefectures.length > 0) {
      // オンライン専用イベントは開催地を持たないので地域指定時は除外する
      if (!event.prefecture || !filter.prefectures.includes(event.prefecture)) return false;
    }

    if (keyword) {
      const text = `${event.title} ${event.description ?? ''} ${event.organizer ?? ''} ${event.tags.join(' ')}`.toLowerCase();
      if (!text.includes(keyword)) return false;
    }

    return true;
  });
}

/** 募集が締め切られた（もしくは開催済みの）イベントか */
export function isExpired(event: EventItem): boolean {
  return countdownTarget(event) < startOfDay(new Date());
}

export function resolveDatePreset(preset: string): { from: Date | null; to: Date | null } {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'this_week':
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'this_month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    default:
      return { from: null, to: null };
  }
}

export function formatDateForParam(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

export function parseDateParam(param: string): Date | null {
  if (!param) return null;
  return new Date(param);
}
