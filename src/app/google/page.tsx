import { CalendarDays, CheckCircle2, ExternalLink, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { GoogleSyncControls } from "@/features/google/GoogleSyncControls";
import { isRelevantGoogleMail } from "@/features/google/mailRelevance";
import { getGoogleConfig } from "@/features/google/server/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dateLabel(value: Date | null | undefined): string {
  return value ? new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(value) : "未同期";
}

export default async function GooglePage({ searchParams }: { searchParams?: Promise<{ connected?: string; error?: string }> }) {
  const query = await searchParams;
  const config = getGoogleConfig();
  const connection = await prisma.googleConnection.findUnique({ where: { id: "google" } });
  const [storedMails, events] = connection ? await Promise.all([
    prisma.googleGmailMessage.findMany({ where: { connectionId: "google", isRelevant: true }, orderBy: { receivedAt: "desc" }, take: 30 }),
    prisma.googleCalendarEvent.findMany({ where: { connectionId: "google", startsAt: { gte: new Date(Date.now() - 14 * 86_400_000) } }, orderBy: { startsAt: "asc" }, take: 50 })
  ]) : [[], []];
  // 過去の同期データも現在の厳密な条件で再判定して、不要なメールを画面に出さない。
  const mails = storedMails.filter(isRelevantGoogleMail);
  const notice = query?.connected === "1" ? "Googleでログインし、GmailとGoogle Calendarの初回同期まで完了しました。" : query?.error;

  return <WorkspaceShell><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
    <header className="rounded-[30px] border border-[#f0ded3] bg-[#fffaf6] px-6 py-7 shadow-[0_12px_40px_rgba(93,49,23,0.06)] sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div><div className="inline-flex items-center gap-2 rounded-full bg-[#fff0e7] px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-[#b75020]"><ShieldCheck className="h-3.5 w-3.5" />GOOGLE WORKSPACE</div><h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#332118] sm:text-4xl">Googleでログインして<br />メールと予定を集める。</h1><p className="mt-2 max-w-xl text-base leading-7 text-[#80695e]">一度のGoogle同意で、インターン・技術イベントに関係するメールと、これからの予定をこのPCだけに整理します。</p></div>
        <div className="rounded-2xl bg-white px-4 py-3 text-sm shadow-sm"><div className="font-semibold text-[#332118]">{connection?.email ?? "未連携"}</div><div className="mt-1 text-[#80695e]">{connection ? "読み取り専用" : "Google OAuthで接続"}</div></div>
      </div>
    </header>

    {notice && <p className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${query?.error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{notice}</p>}

    <section className="mt-6 rounded-[28px] border border-border bg-background p-6 shadow-[0_8px_24px_rgba(74,40,22,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><h2 className="text-xl font-bold text-[#332118]">Google連携</h2><p className="mt-2 text-base leading-7 text-[#80695e]">Gmail本文・添付・予定の説明文は保存しません。Googleの同意画面で許可した読み取り権限だけを使います。</p></div><GoogleSyncControls connected={Boolean(connection)} canConnect={config.configured} /></div>
      {!config.configured && <div className="mt-5 rounded-2xl bg-[#fff6ee] p-4 text-sm leading-6 text-[#80695e]"><div className="flex items-center gap-2 font-semibold text-[#5b3422]"><LockKeyhole className="h-4 w-4" />最初の設定が必要です</div><p className="mt-2">Google Cloud ConsoleでGmail API・Google Calendar APIを有効にし、Web applicationのOAuthクライアントを作成してください。承認済みリダイレクトURIは <code className="rounded bg-white px-1.5 py-0.5">http://localhost:3000/api/google/callback</code> です。作成した値を <code className="rounded bg-white px-1.5 py-0.5">.env.local</code> のGoogle項目へ入れ、サーバーを再起動すると連携できます。</p></div>}
      {connection && <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#fff8f3] p-4"><div className="flex items-center gap-2 font-semibold text-[#4a2b1b]"><Mail className="h-4 w-4" />Gmail</div><p className="mt-1 text-sm text-[#80695e]">最終同期: {dateLabel(connection.gmailLastSyncedAt)}</p></div><div className="rounded-2xl bg-[#fff8f3] p-4"><div className="flex items-center gap-2 font-semibold text-[#4a2b1b]"><CalendarDays className="h-4 w-4" />Google Calendar</div><p className="mt-1 text-sm text-[#80695e]">最終同期: {dateLabel(connection.calendarLastSyncedAt)}</p></div></div>}
    </section>

    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="rounded-[28px] border border-border bg-background p-5 shadow-[0_8px_24px_rgba(74,40,22,0.05)]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[0.12em] text-[#b75020]">RELEVANT GMAIL</p><h2 className="mt-1 text-xl font-bold text-[#332118]">インターン・技術イベント</h2></div><span className="rounded-full bg-[#fff0e7] px-3 py-1 text-sm font-semibold text-[#a34d22]">{mails.length}件</span></div>{mails.length === 0 ? <p className="mt-6 rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm leading-6 text-[#80695e]">同期後、インターン関連、または技術イベント関連のメールだけをここへ表示します。</p> : <div className="mt-5 space-y-3">{mails.map((mail) => <article key={mail.id} className="rounded-2xl border border-[#f0e2d9] p-4"><p className="truncate text-sm font-semibold text-[#5b3422]">{mail.fromAddress ?? "差出人不明"}</p><h3 className="mt-1 font-bold leading-6 text-[#332118]">{mail.subject}</h3>{mail.snippet && <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#80695e]">{mail.snippet}</p>}<div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#80695e]"><span>{dateLabel(mail.receivedAt)}</span>{mail.gmailUrl && <a href={mail.gmailUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#b75020]">Gmailで開く <ExternalLink className="h-3.5 w-3.5" /></a>}</div></article>)}</div>}</section>
      <section className="rounded-[28px] border border-border bg-background p-5 shadow-[0_8px_24px_rgba(74,40,22,0.05)]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[0.12em] text-[#b75020]">UPCOMING CALENDAR</p><h2 className="mt-1 text-xl font-bold text-[#332118]">これからの予定</h2></div><span className="rounded-full bg-[#effaf4] px-3 py-1 text-sm font-semibold text-[#28744b]">{events.length}件</span></div>{events.length === 0 ? <p className="mt-6 rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm leading-6 text-[#80695e]">同期後、過去14日から180日先までのメインカレンダー予定を表示します。</p> : <div className="mt-5 space-y-3">{events.map((event) => <article key={event.id} className="rounded-2xl border border-[#e0eee5] p-4"><div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#effaf4] text-[#28744b]"><CalendarDays className="h-5 w-5" /></div><div className="min-w-0 flex-1"><h3 className="font-bold leading-6 text-[#332118]">{event.summary}</h3><p className="mt-1 text-sm text-[#80695e]">{event.isAllDay ? new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(event.startsAt) : dateLabel(event.startsAt)}</p>{event.location && <p className="mt-1 truncate text-sm text-[#80695e]">{event.location}</p>}{event.htmlLink && <a href={event.htmlLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#28744b]">Calendarで開く <ExternalLink className="h-3.5 w-3.5" /></a>}</div></div></article>)}</div>}</section>
    </div>
    <p className="mt-6 flex items-center gap-2 text-sm text-[#80695e]"><CheckCircle2 className="h-4 w-4 text-[#28744b]" />連携解除を押すと、保存済みのGoogleトークンと同期データもこのPCから削除されます。</p>
  </div></WorkspaceShell>;
}
