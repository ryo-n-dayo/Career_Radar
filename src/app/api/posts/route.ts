import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const result = value.trim();
  return result || undefined;
}

function tags(value: unknown): string[] {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return [...new Set(source.filter((item): item is string => typeof item === "string").map((item) => item.trim().replace(/^#/, "")).filter(Boolean))].slice(0, 20);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "入力が不正です" }, { status: 400 });

  const id = text(body.id);
  const url = text(body.url);
  const content = text(body.content);
  if (!url || !content) return NextResponse.json({ error: "URLと投稿本文は必須です" }, { status: 400 });

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
  } catch {
    return NextResponse.json({ error: "URLの形式が正しくありません" }, { status: 400 });
  }

  const postedAtRaw = text(body.postedAt);
  const postedAt = postedAtRaw ? new Date(postedAtRaw) : null;
  if (postedAt && Number.isNaN(postedAt.getTime())) return NextResponse.json({ error: "投稿日時が不正です" }, { status: 400 });

  const data = {
    url,
    content,
    author: text(body.author) ?? null,
    account: text(body.account) ?? null,
    summary: text(body.summary) ?? null,
    memo: text(body.memo) ?? null,
    tags: tags(body.tags),
    postedAt,
    companyId: text(body.companyId) ?? null
  };

  try {
    const post = id
      ? await prisma.savedPost.update({ where: { id }, data })
      : await prisma.savedPost.upsert({ where: { url }, create: data, update: data });
    revalidatePath("/");
    revalidatePath("/posts");
    return NextResponse.json({ id: post.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存できませんでした" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "idは必須です" }, { status: 400 });
  await prisma.savedPost.delete({ where: { id } }).catch(() => null);
  revalidatePath("/");
  revalidatePath("/posts");
  return NextResponse.json({ deleted: id });
}
