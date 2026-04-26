import { SourceType } from './source';

export interface FilterState {
  dateFrom: Date | null;
  dateTo: Date | null;
  datePreset: 'today' | 'this_week' | 'this_month' | 'all' | 'custom';
  categories: Category[];
  sources: SourceType[];
  keyword: string;
}

export type Category = 'インターン' | '説明会' | '選考';

export const ALL_CATEGORIES: Category[] = [
  'インターン', '説明会', '選考'
];

export const DEFAULT_FILTER: FilterState = {
  dateFrom: null,
  dateTo: null,
  datePreset: 'all',
  categories: [],
  sources: [],
  keyword: '',
};
