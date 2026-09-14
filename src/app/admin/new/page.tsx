import { Suspense } from "react";

import { EventForm } from "@/features/events/components/admin/EventForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const companies = await prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <a href="/admin" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
        ← 管理トップ
      </a>
      <h1 className="mt-3 text-xl font-semibold tracking-tight">イベントを登録</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        マイナビ・X・企業サイトなど、告知ページの URL を貼ると分かる範囲を自動で埋めます。残りは手で入れてください。
      </p>

      <Suspense fallback={<div className="mt-6 text-sm text-muted-foreground">読み込み中...</div>}>
        <EventForm companies={companies} />
      </Suspense>
    </main>
  );
}
