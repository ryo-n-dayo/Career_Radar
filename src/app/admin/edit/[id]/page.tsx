import { notFound } from "next/navigation";

import { EventForm } from "@/features/events/components/admin/EventForm";
import { getEventById } from "@/features/events/server/getEvents";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, companies] = await Promise.all([
    getEventById(id),
    prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
  ]);
  if (!event) notFound();

  return <main className="mx-auto max-w-3xl px-5 py-8"><a href="/admin" className="text-xs text-muted-foreground hover:text-foreground">← イベント編集へ</a><h1 className="mt-3 text-xl font-semibold tracking-tight">イベントを修正</h1><p className="mt-1.5 text-sm text-muted-foreground">保存済みの内容を修正します。</p><EventForm initialEvent={event} companies={companies} /></main>;
}
