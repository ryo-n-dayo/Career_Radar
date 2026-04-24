"use client";

import { useCallback, useEffect, useState } from "react";

export type CompanyCredential = {
  loginUrl?: string;
  loginId?: string;
  password?: string;
  note?: string;
  updatedAt?: string;
};

type Store = Record<string, CompanyCredential>;

const STORAGE_KEY = "career-radar:company-credentials";

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function useCompanyCredentials() {
  const [store, setStore] = useState<Store>({});

  useEffect(() => {
    setStore(readStore());
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setStore(readStore());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const get = useCallback(
    (companyId: string): CompanyCredential | undefined => store[companyId],
    [store]
  );

  const save = useCallback((companyId: string, value: CompanyCredential) => {
    setStore((prev) => {
      const next = {
        ...prev,
        [companyId]: { ...value, updatedAt: new Date().toISOString() }
      };
      writeStore(next);
      return next;
    });
  }, []);

  const remove = useCallback((companyId: string) => {
    setStore((prev) => {
      const next = { ...prev };
      delete next[companyId];
      writeStore(next);
      return next;
    });
  }, []);

  return { get, save, remove, all: store };
}
