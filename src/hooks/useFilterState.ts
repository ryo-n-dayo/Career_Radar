"use client";

import { useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FilterState, ALL_FORMATS, ALL_KINDS } from "@/types/filter";
import type { EventFormat, EventKind } from "@/features/events/types/eventItem";
import { parseDateParam, formatDateForParam } from "@/lib/filters";

function parseSearchParams(searchParams: URLSearchParams): FilterState {
  const dateFrom = parseDateParam(searchParams.get('from') || '');
  const dateTo = parseDateParam(searchParams.get('to') || '');
  const datePreset = (searchParams.get('preset') as FilterState['datePreset']) || 'all';

  const kindsParam = searchParams.get('kinds');
  const kinds = kindsParam
    ? (kindsParam.split(',').filter(k => ALL_KINDS.includes(k as EventKind)) as EventKind[])
    : [];

  const formatsParam = searchParams.get('formats');
  const formats = formatsParam
    ? (formatsParam.split(',').filter(f => ALL_FORMATS.includes(f as EventFormat)) as EventFormat[])
    : [];

  const prefecturesParam = searchParams.get('pref');
  const prefectures = prefecturesParam ? prefecturesParam.split(',').filter(Boolean) : [];

  return {
    dateFrom,
    dateTo,
    datePreset,
    kinds,
    formats,
    prefectures,
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
  if (filter.kinds.length > 0) {
    params.set('kinds', filter.kinds.join(','));
  }
  if (filter.formats.length > 0) {
    params.set('formats', filter.formats.join(','));
  }
  if (filter.prefectures.length > 0) {
    params.set('pref', filter.prefectures.join(','));
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
    filter.kinds.length > 0 ||
    filter.formats.length > 0 ||
    filter.prefectures.length > 0 ||
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
