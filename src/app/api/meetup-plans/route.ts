import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  // Even on localhost, other sites must not be able to change private notes.
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "この操作はDailyNewsの画面から行ってください" }, { status: 403 });
  }
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "保存内容が不正です" }, { status: 400 });
  }
  const value = body as Record<string, unknown>;
  if (typeof value.url !== "string" || value.url.length > 2048
    || (value.saved !== undefined && typeof value.saved !== "boolean")
    || ["people", "talks"].some((key) => value[key] !== undefined && (typeof value[key] !== "string" || (value[key] as string).length > 1000))
    || ["saved", "people", "talks"].every((key) => value[key] === undefined)) {
    return NextResponse.json({ error: "メモは各1,000文字以内で入力してください" }, { status: 400 });
  }
  const event = await prisma.candidate.findFirst({
    where: { url: value.url, source: { kind: { in: ["X_ALGO_TECH_EVENT", "TECH_EVENTS"] } } },
    select: { id: true }
  });
  if (!event) return NextResponse.json({ error: "イベントが見つかりません。画面を再読み込みしてください" }, { status: 404 });
  const data = {
    ...(typeof value.saved === "boolean" ? { saved: value.saved } : {}),
    ...(typeof value.people === "string" ? { people: value.people.trim() } : {}),
    ...(typeof value.talks === "string" ? { talks: value.talks.trim() } : {})
  };
  try {
    // Partial updates preserve notes when bookmarking, and preserve the bookmark when editing notes.
    const plan = await prisma.meetupPlan.upsert({
      where: { url: value.url }, create: { url: value.url, ...data }, update: data,
      select: { saved: true, people: true, talks: true }
    });
    revalidatePath("/meetups");
    return NextResponse.json(plan);
  } catch {
    return NextResponse.json({ error: "保存できませんでした。入力内容はそのまま残っています。もう一度お試しください" }, { status: 500 });
  }
}
