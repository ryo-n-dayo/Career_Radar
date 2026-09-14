import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const KINDS = new Set(["PAGE", "CAREERS", "NEW_GRAD", "TECH_EVENTS", "TECH_BENEFITS", "TECH_NEWS", "RSS", "SITEMAP", "X_MANUAL", "X_API"]);

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function validHttpUrl(value: string): boolean {
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = text(body?.name);
  const rawUrl = text(body?.url);
  if (!body || !name || !rawUrl || !validHttpUrl(rawUrl)) return NextResponse.json({ error: "名前と正しいURLは必須です" }, { status: 400 });

  const url = new URL(rawUrl);
  url.hash = "";
  const isX = ["x.com", "twitter.com"].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  const requestedKind = text(body.kind) ?? "PAGE";
  const kind = isX ? requestedKind === "X_API" ? "X_API" : "X_MANUAL" : KINDS.has(requestedKind) ? requestedKind : "PAGE";
  const confirmed = body.confirmed === true && kind !== "X_MANUAL";
  const termsUrl = text(body.termsUrl);
  if (termsUrl && !validHttpUrl(termsUrl)) return NextResponse.json({ error: "利用規約URLが不正です" }, { status: 400 });
  if (kind !== "X_MANUAL" && !confirmed) return NextResponse.json({ error: "公開ページ・robots.txt・利用条件を尊重する確認が必要です" }, { status: 400 });

  try {
    const source = await prisma.watchSource.create({
      data: {
        name,
        url: url.toString(),
        kind,
        confirmedAt: confirmed ? new Date() : null,
        termsUrl: termsUrl ?? null,
        notes: text(body.notes) ?? null,
        companyId: text(body.companyId) ?? null,
        lastStatus: kind === "X_MANUAL" ? "X_MANUAL" : "PENDING"
      }
    });
    revalidatePath("/"); revalidatePath("/sources");
    return NextResponse.json({ id: source.id });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Unique constraint") ? "このURLは登録済みです" : "登録できませんでした";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "idは必須です" }, { status: 400 });
  await prisma.watchSource.delete({ where: { id } }).catch(() => null);
  revalidatePath("/"); revalidatePath("/sources");
  return NextResponse.json({ deleted: id });
}
