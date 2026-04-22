"use client";

import { useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FilterState, ALL_CATEGORIES, Category } from "@/types/filter";
import { SourceType, SOURCE_TYPES } from "@/types/source";
import { parseDateParam, formatDateForParam } from "@/lib/filters";

function parseSearchParams(searchParams: URLSearchParams): FilterState {
  const dateFrom = parseDateParam(searchParams.get('from') || '');
  const dateTo = parseDateParam(searchParams.get('to') || '');
  const datePreset = (searchParams.get('preset') as FilterState['datePreset']) || 'all';

  const categoriesParam = searchParams.get('categories');
  const categories = categoriesParam
    ? (categoriesParam.split(',').filter(c => ALL_CATEGORIES.includes(c as Category)) as Category[])
    : [];

  const sourcesParam = searchParams.get('sources');
  const sources = sourcesParam
    ? (sourcesParam.split(',').filter(s => SOURCE_TYPES.includes(s as SourceType)) as SourceType[])
    : [];

  return {
    dateFrom,
    dateTo,
    datePreset,
    categories,
    sources,
    keyword: searchParams.get('q') || '',
  };
}

function filterToSearchParams(filter: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filter.datePreset !== 'all') {
    params.set('preset', filter.datePreset);
  }
  if (filter.datePreset === 'custom' || (filter.dateFrom && filter.dateTo)) {
    if (filter.dateFrom) params.set('from', formatDateForParam(filter.dateFrom));
    if (filter.dateTo) params.set('to', formatDateForParam(filter.dateTo));
  }
  if (filter.categories.length > 0) {
    params.set('categories', filter.categories.join(','));
  }
  if (filter.sources.length > 0) {
    params.set('sources', filter.sources.join(','));
  }
  if (filter.keyword) {
    params.set('q', filter.keyword);
  }
  
  return params;
}

export function useFilterState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filter: FilterState = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams]
  );

  const isFiltered =
    filter.datePreset !== 'all' ||
    filter.categories.length > 0 ||
    filter.sources.length > 0 ||
    filter.keyword !== '';

  const updateFilter = useCallback((updates: Partial<FilterState>) => {
    const next = { ...filter, ...updates };
    const params = filterToSearchParams(next);
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [filter, router, pathname]);

  const resetFilter = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return { filter, updateFilter, resetFilter, isFiltered };
}
