import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const STATUSES = new Set(["NEW", "REVIEWED", "IGNORED"]);
const FEEDBACK_VALUES = new Set([-2, -1, 0, 1, 2]);

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = typeof body?.id === "string" ? body.id : undefined;
  const feedbackValue = typeof body?.feedbackValue === "number" ? body.feedbackValue : undefined;
  const feedbackReason = typeof body?.feedbackReason === "string" ? body.feedbackReason.trim().replace(/\s+/g, " ") : undefined;
  if (feedbackReason && feedbackReason.length > 280) return NextResponse.json({ error: "理由は280文字以内で入力してください" }, { status: 400 });
  if (id && feedbackValue !== undefined) {
    if (!FEEDBACK_VALUES.has(feedbackValue)) return NextResponse.json({ error: "興味度は-2から2で指定してください" }, { status: 400 });
    const status = feedbackValue < 0 ? "IGNORED" : "REVIEWED";
    await prisma.candidate.update({ where: { id }, data: { feedbackValue, feedbackReason: feedbackReason || null, status } });
    revalidatePath("/"); revalidatePath("/feed"); revalidatePath("/sources"); revalidatePath("/algorithm");
    return NextResponse.json({ id, feedbackValue, feedbackReason: feedbackReason || null, status });
  }
  const status = typeof body?.status === "string" ? body.status : undefined;
  if (!id || !status || !STATUSES.has(status)) return NextResponse.json({ error: "更新内容が不正です" }, { status: 400 });
  await prisma.candidate.update({ where: { id }, data: { status } });
  revalidatePath("/"); revalidatePath("/sources");
  return NextResponse.json({ id, status });
}
