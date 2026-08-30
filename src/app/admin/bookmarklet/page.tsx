import { BookmarkletLink } from "@/features/events/components/admin/BookmarkletLink";

export const dynamic = "force-dynamic";

export default function BookmarkletPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <a href="/admin" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
        ← 管理トップ
      </a>
      <h1 className="mt-3 text-xl font-semibold tracking-tight">ブックマークレット</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        見ているページからイベントを1クリックで登録フォームに送ります。
      </p>

      <BookmarkletLink />
    </main>
  );
}
