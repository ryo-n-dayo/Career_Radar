import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { parseEventInput } from "@/features/events/ingest/parseEventInput";
import { updateEvent, upsertEvent } from "@/features/events/ingest/upsert";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** 認証は Cloudflare Access（Worker 単位のポリシー）に任せている。アプリ内には認証を持たない。 */

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = parseEventInput(body);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const outcome = id ? (await updateEvent(id, parsed.value), "updated" as const) : await upsertEvent(parsed.value);
    const event = await prisma.event.findUnique({
      where: { url: parsed.value.url },
      select: { id: true }
    });

    // 全ページ force-dynamic なので実質 no-op だが、キャッシュを入れた時に効くよう残す
    revalidatePath("/");
    if (event) revalidatePath(`/events/${event.id}`);

    return NextResponse.json({ outcome, id: event?.id }, { status: outcome === "created" ? 201 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id は必須です" }, { status: 400 });
  }

  try {
    await prisma.event.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath(`/events/${id}`);
    return NextResponse.json({ deleted: id });
  } catch {
    return NextResponse.json({ error: "該当するイベントがありません" }, { status: 404 });
  }
}
