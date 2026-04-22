"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function LeftNav() {
  const [isDark, setIsDark] = useState(false);

  const initial = useMemo(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  }, []);

  useEffect(() => {
    setIsDark(initial);
  }, [initial]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleGoogleAuth = async () => {
    try {
      const userId = "demo-user-id";
      const response = await fetch(`/api/auth/google?userId=${userId}`);
      const data = await response.json();
      if (data.authUrl) {
        window.open(data.authUrl, '_blank');
      }
    } catch (error) {
      console.error('Google auth error:', error);
    }
  };

  return (
    <nav className="flex h-full flex-col gap-4 p-3">
      <div className="px-2 py-3">
        <div className="text-sm font-semibold tracking-tight">Career Radar</div>
        <div className="text-xs text-muted-foreground">DB一覧と企業別フォルダを削除しました。</div>
      </div>

      <div className="px-2">
        <div className="text-xs font-medium text-muted-foreground">Google連携</div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full justify-start"
          onClick={handleGoogleAuth}
        >
          🔗 Google接続
        </Button>
      </div>

      <Separator className="my-2" />

      <div className="px-2">
        <div className="text-xs font-medium text-muted-foreground">X取り込み</div>
        <a
          href="/import/x"
          className="mt-3 inline-flex h-9 w-full items-center justify-start rounded-md border border-input bg-background px-3 text-sm shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          ✍️ 手動で取り込む
        </a>
        <a
          href="/settings/bookmarklet"
          className="mt-2 inline-flex h-9 w-full items-center justify-start rounded-md border border-input bg-background px-3 text-sm shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          📌 ブックマークレット
        </a>
      </div>

      <Separator className="my-2" />

      <div className="px-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setIsDark((v) => !v)}
        >
          {isDark ? "🌙 ダーク" : "☀️ ライト"}
        </Button>
      </div>

      <div className="mt-auto px-2 pb-2 text-xs text-muted-foreground">
        メインDB内でカレンダー切り替えが可能です。
      </div>
    </nav>
  );
}
