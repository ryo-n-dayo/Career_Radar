"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RefreshCw, Unplug } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GoogleSyncControls({ connected, canConnect }: { connected: boolean; canConnect: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sync() {
    setBusy(true); setMessage(null);
    const response = await fetch("/api/google/sync", { method: "POST" });
    const data = await response.json().catch(() => ({})) as { gmail?: number; calendar?: number; error?: string };
    setMessage(response.ok ? `Gmail ${data.gmail ?? 0}件・カレンダー ${data.calendar ?? 0}件を確認しました。` : (data.error ?? "同期できませんでした。"));
    setBusy(false); router.refresh();
  }

  async function disconnect() {
    if (!window.confirm("Googleの接続と、PCに保存したGmail・カレンダーの同期データを削除しますか？")) return;
    setBusy(true); setMessage(null);
    await fetch("/api/google/disconnect", { method: "DELETE" });
    setBusy(false); router.refresh();
  }

  if (!connected) return canConnect ? <a href="/api/google/connect" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#4a2b1b] px-4 text-sm font-semibold text-white transition hover:bg-[#623a24]">Googleでログインして連携</a> : null;
  return <div className="flex flex-wrap items-center gap-2"><Button type="button" onClick={sync} disabled={busy} className="gap-2 rounded-xl bg-[#4a2b1b] text-white hover:bg-[#623a24]">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}今すぐ同期</Button><Button type="button" variant="outline" onClick={disconnect} disabled={busy} className="gap-2 rounded-xl text-rose-700 hover:text-rose-800"><Unplug className="h-4 w-4" />連携を解除</Button>{message && <p className="basis-full text-sm text-muted-foreground">{message}</p>}</div>;
}
