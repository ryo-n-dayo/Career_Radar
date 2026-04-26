import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category"); // "CAREER_TIP" | "INTERNSHIP" | "COLUMN" | null (= all)
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 100);

  const articles = await prisma.newsArticle.findMany({
    where: category ? { category } : undefined,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  const unreadCount = await prisma.newsArticle.count({ where: { isRead: false } });

  return NextResponse.json({ articles, unreadCount });
}

// 記事を既読にする
export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const all = searchParams.get("all");

  if (all === "true") {
    await prisma.newsArticle.updateMany({ data: { isRead: true } });
    return NextResponse.json({ ok: true });
  }

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.newsArticle.update({ where: { id }, data: { isRead: true } });
  return NextResponse.json({ ok: true });
}
