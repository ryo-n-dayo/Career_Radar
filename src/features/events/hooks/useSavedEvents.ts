"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "saved_events";

function load(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/**
 * 保存済みイベントの id 集合。ログイン不要のサイトなので localStorage のみで完結する。
 * SSR とハイドレーションの不一致を避けるため、初期値は空で始めてマウント後に読み込む。
 */
export function useSavedEvents() {
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setSavedIds(new Set(load()));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedIds]));
    } catch {
      // プライベートモード等で書き込めない場合は保存を諦める
    }
  }, [savedIds, isHydrated]);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  return { savedIds, toggleSaved, isSaved, isHydrated };
}
