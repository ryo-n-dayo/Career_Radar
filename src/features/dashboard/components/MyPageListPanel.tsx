"use client";

import { useMemo } from "react";

import { useCompanyCredentials } from "../hooks/useCompanyCredentials";
import type { RadarItem } from "../types/radarItem";
import { CredentialsSection } from "./CredentialsSection";

type Props = {
  items: RadarItem[];
};

export function MyPageListPanel({ items }: Props) {
  const { all } = useCompanyCredentials();

  const targets = useMemo(
    () => items.filter((item) => item.saved || Boolean(all[item.id])),
    [items, all]
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-auto">
      <p className="text-xs text-muted-foreground">
        保存済み（★）の企業、またはマイページ情報を登録済みの企業のURL・ID・パスワードをまとめて確認・登録できます。
      </p>

      {targets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center text-sm text-muted-foreground">
          まだ対象の企業がありません。メインDBで企業を保存（★）するとここに表示されます。
        </div>
      ) : (
        targets.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-background p-3">
            <div className="mb-2 flex items-center gap-2">
              {item.saved && (
                <span className="text-[hsl(var(--accent))]">★</span>
              )}
              <div className="text-sm font-semibold">{item.companyName}</div>
              <span className="ml-auto text-xs text-muted-foreground">{item.content}</span>
            </div>
            <CredentialsSection companyId={item.id} companyName={item.companyName} />
          </div>
        ))
      )}
    </div>
  );
}
