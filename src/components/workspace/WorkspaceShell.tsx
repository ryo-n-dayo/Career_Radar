"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgePercent, BriefcaseBusiness, BrainCircuit, CalendarDays, CircleDollarSign, GraduationCap, Home, LockKeyhole, MessageCircleHeart, Settings2, Sparkles } from "lucide-react";

import { APP_NAME, APP_TAGLINE } from "@/lib/appConfig";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/feed", label: "Xフィード", icon: MessageCircleHeart },
  { href: "/algorithm", label: "フィードの仕組み", icon: BrainCircuit },
  { href: "/meetups", label: "技術イベント", icon: Sparkles },
  { href: "/internships", label: "インターン募集", icon: BriefcaseBusiness },
  { href: "/job-hunting", label: "就活", icon: GraduationCap },
  { href: "/it-news", label: "ITニュース", icon: BadgePercent },
  { href: "/google", label: "Google連携", icon: CalendarDays },
  { href: "/x-api", label: "X API利用額", icon: CircleDollarSign },
  { href: "/sources", label: "収集設定", icon: Settings2 }
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[238px_1fr]">
      <a href="#dailynews-main" className="sr-only z-50 rounded-lg bg-foreground p-3 text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4">メインの内容へ移動</a>
      <aside className="flex flex-col border-b border-border bg-[#fffdfa]/90 px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <Link href="/" className="flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent-2))] text-xs font-bold text-white shadow-sm">DN</div>
          <div className="min-w-0"><div className="font-semibold tracking-tight">{APP_NAME}</div><div className="text-xs leading-relaxed text-muted-foreground">{APP_TAGLINE}</div></div>
        </Link>
        <nav aria-label="メインメニュー" className="mt-5 flex gap-1 overflow-x-auto pb-1 lg:mt-10 lg:flex-col lg:overflow-visible">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <div key={href} className={cn("shrink-0", href === "/google" && "lg:mt-6 lg:border-t lg:border-border lg:pt-5")}>
                {href === "/google" && <p className="mb-2 hidden px-3 text-xs font-semibold text-muted-foreground lg:block">連携・設定</p>}
                <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors", active ? "bg-[hsl(var(--accent))] text-white shadow-sm" : "text-muted-foreground hover:bg-[hsl(var(--accent-soft))] hover:text-foreground")}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden />{label}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="mt-auto hidden pt-8 lg:block"><div className="flex items-start gap-2 rounded-xl bg-[hsl(var(--accent-soft))]/45 p-3 text-xs leading-relaxed text-muted-foreground"><LockKeyhole size={15} className="mt-0.5 shrink-0" aria-hidden /><p>この端末で利用中<br />保存データはこのPCに保管</p></div></div>
      </aside>
      <main id="dailynews-main" tabIndex={-1} className="min-w-0">{children}</main>
    </div>
  );
}


