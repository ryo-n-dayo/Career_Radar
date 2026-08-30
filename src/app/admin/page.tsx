import { EventAdminList } from "@/features/events/components/admin/EventAdminList";
import { getEvents } from "@/features/events/server/getEvents";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const events = await getEvents();

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">管理</h1>
        <span className="text-xs text-muted-foreground">{events.length}件</span>
        <div className="ml-auto flex gap-2">
          <a
            href="/admin/bookmarklet"
            className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm transition-colors hover:bg-muted"
          >
            ブックマークレット
          </a>
          <a
            href="/admin/new"
            className="inline-flex h-9 items-center rounded-md bg-[hsl(var(--accent))] px-3 text-sm font-medium text-white transition hover:bg-[hsl(var(--accent))]/90"
          >
            + 登録
          </a>
        </div>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        マイナビや X で見つけたイベントは、URL を貼るか ブックマークレット から登録します。
      </p>

      <EventAdminList events={events} />

      <a
        href="/"
        className="mt-8 inline-block text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        ← サイトを見る
      </a>
    </main>
  );
}
