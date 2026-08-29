"use client";

import { useCallback, useEffect, useState } from "react";

export type SnippetType = "self_pr" | "gakuchika" | "motivation" | "other";

export type SelfPRSnippet = {
  id: string;
  type: SnippetType;
  title: string;
  content: string;
  tags?: string[];
  updatedAt: string;
};

const STORAGE_KEY = "career-radar:selfpr-snippets";
const CHANGE_EVENT = "career-radar:selfpr-snippets-changed";

function readStore(): SelfPRSnippet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SelfPRSnippet[]) : [];
  } catch {
    return [];
  }
}

function writeStore(snippets: SelfPRSnippet[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useSelfPRSnippets() {
  const [snippets, setSnippets] = useState<SelfPRSnippet[]>([]);

  useEffect(() => {
    setSnippets(readStore());
    const refresh = () => setSnippets(readStore());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CHANGE_EVENT, refresh);
    };
  }, []);

  const add = useCallback((snippet: Omit<SelfPRSnippet, "id" | "updatedAt">) => {
    setSnippets((prev) => {
      const next: SelfPRSnippet[] = [
        ...prev,
        { ...snippet, id: crypto.randomUUID(), updatedAt: new Date().toISOString() }
      ];
      writeStore(next);
      return next;
    });
  }, []);

  const update = useCallback((id: string, value: Omit<SelfPRSnippet, "id" | "updatedAt">) => {
    setSnippets((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...value, id, updatedAt: new Date().toISOString() } : s
      );
      writeStore(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSnippets((prev) => {
      const next = prev.filter((s) => s.id !== id);
      writeStore(next);
      return next;
    });
  }, []);

  return { snippets, add, update, remove };
}
