import { NextRequest, NextResponse } from "next/server";

import { classifyFormat, classifyKind } from "@/features/events/ingest/classify";
import { ingestSourceFromUrl } from "@/features/events/types/eventItem";
import { FetchPageMetaError, fetchPageMeta } from "@/lib/metadata/fetchPageMeta";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

/**
 * URL を1回だけ取得して、登録フォームの前埋め用の推定結果を返す。
 * 認証は Cloudflare Access（Worker 単位のポリシー）に任せている。アプリ内には認証を持たない。
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  const url = body?.url?.trim();

  if (!url) {
    return NextResponse.json({ error: "url は必須です" }, { status: 400 });
  }

  try {
    const meta = await fetchPageMeta(url);
    const title = meta.title ?? "";

    return NextResponse.json({
      meta: {
        url: meta.url,
        title: meta.title,
        description: meta.description,
        imageUrl: meta.imageUrl,
        siteName: meta.siteName,
        startsAt: meta.startsAt?.toISOString(),
        endsAt: meta.endsAt?.toISOString(),
        venue: meta.venue
      },
      suggestion: {
        kind: classifyKind({ title, description: meta.description }),
        format: classifyFormat({ venue: meta.venue, title, description: meta.description }),
        ingestSource: ingestSourceFromUrl(meta.url),
        organizer: meta.siteName
      }
    });
  } catch (error) {
    if (error instanceof FetchPageMetaError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
