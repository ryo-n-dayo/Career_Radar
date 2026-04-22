import { SourceType } from './source';

export interface FilterState {
  dateFrom: Date | null;
  dateTo: Date | null;
  datePreset: 'today' | 'this_week' | 'this_month' | 'all' | 'custom';
  categories: Category[];
  sources: SourceType[];
  keyword: string;
}

export type Category = '説明会' | '早期選考' | '本選考' | 'インターン' | 'セミナー';

export const ALL_CATEGORIES: Category[] = [
  '説明会', '早期選考', '本選考', 'インターン', 'セミナー'
];

export const DEFAULT_FILTER: FilterState = {
  dateFrom: null,
  dateTo: null,
  datePreset: 'all',
  categories: [],
  sources: [],
  keyword: '',
};
