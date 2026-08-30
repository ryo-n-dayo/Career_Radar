import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { parseEventInput } from "@/features/events/ingest/parseEventInput";
import { upsertEvent } from "@/features/events/ingest/upsert";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** 認証は middleware.ts の /api/admin ガードに任せている。 */

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = parseEventInput(body);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const outcome = await upsertEvent(parsed.value);
    const event = await prisma.event.findUnique({
      where: { url: parsed.value.url },
      select: { id: true }
    });

    // トップ（ISR 10分）と個別ページを即座に反映させる
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
