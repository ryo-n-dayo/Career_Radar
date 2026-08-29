import { FilterState } from '@/types/filter';
import { SourceType } from '@/types/source';
import { RadarItem } from '@/features/dashboard/types/radarItem';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export function applyFilters(posts: RadarItem[], filter: FilterState): RadarItem[] {
  const keyword = filter.keyword.toLowerCase();

  return posts.filter(post => {
    if (filter.dateFrom || filter.dateTo) {
      const postDate = new Date(post.date);
      if (filter.dateFrom && postDate < filter.dateFrom) return false;
      if (filter.dateTo && postDate > filter.dateTo) return false;
    }

    if (filter.categories.length > 0 && !filter.categories.includes(post.category)) {
      return false;
    }

    if (filter.sources.length > 0) {
      const hasMatch = post.sources.some(s =>
        filter.sources.includes(s.type as SourceType)
      );
      if (!hasMatch) return false;
    }

    if (keyword) {
      const text = `${post.companyName} ${post.content} ${post.keywords.join(' ')}`.toLowerCase();
      if (!text.includes(keyword)) return false;
    }

    return true;
  });
}

export function isExpired(date: string): boolean {
  return new Date(date) < startOfDay(new Date());
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
