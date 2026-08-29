import { EVENT_FORMATS, EVENT_KINDS, type EventFormat, type EventKind } from "@/features/events/types/eventItem";

export interface FilterState {
  dateFrom: Date | null;
  dateTo: Date | null;
  datePreset: 'today' | 'this_week' | 'this_month' | 'all' | 'custom';
  kinds: EventKind[];
  formats: EventFormat[];
  /** 都道府県名。空配列なら絞り込まない。 */
  prefectures: string[];
  keyword: string;
}

export const ALL_KINDS: readonly EventKind[] = EVENT_KINDS;
export const ALL_FORMATS: readonly EventFormat[] = EVENT_FORMATS;

export const DEFAULT_FILTER: FilterState = {
  dateFrom: null,
  dateTo: null,
  datePreset: 'all',
  kinds: [],
  formats: [],
  prefectures: [],
  keyword: '',
};
