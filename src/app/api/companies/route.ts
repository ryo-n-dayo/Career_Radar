import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

function value(input: unknown): string | undefined {
  return typeof input === "string" && input.trim() ? input.trim() : undefined;
}

function parseTags(input: unknown): string[] {
  const source = Array.isArray(input) ? input : typeof input === "string" ? input.split(",") : [];
  return [...new Set(source.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean))].slice(0, 20);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = value(body?.name);
  if (!body || !name) return NextResponse.json({ error: "企業名は必須です" }, { status: 400 });

  const id = value(body.id);
  const website = value(body.website);
  const careersUrl = value(body.careersUrl);
  for (const [label, url] of [["Webサイト", website], ["採用ページ", careersUrl]] as const) {
    if (!url) continue;
    try { new URL(url); } catch { return NextResponse.json({ error: `${label}URLが不正です` }, { status: 400 }); }
  }
  const xHandle = value(body.xHandle)?.replace(/^@/, "");
  const data = { name, website: website ?? null, careersUrl: careersUrl ?? null, xHandle: xHandle ?? null, industry: value(body.industry) ?? null, summary: value(body.summary) ?? null, memo: value(body.memo) ?? null, tags: parseTags(body.tags) };
  try {
    const company = id ? await prisma.company.update({ where: { id }, data }) : await prisma.company.create({ data });
    revalidatePath("/"); revalidatePath("/companies"); revalidatePath("/posts");
    return NextResponse.json({ id: company.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存できませんでした" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "idは必須です" }, { status: 400 });
  await prisma.company.delete({ where: { id } }).catch(() => null);
  revalidatePath("/"); revalidatePath("/companies"); revalidatePath("/posts");
  return NextResponse.json({ deleted: id });
}
