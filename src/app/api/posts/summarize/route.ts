import { NextRequest, NextResponse } from "next/server";

import { summarizeTweet } from "@/lib/ai/summarize";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { content?: string } | null;
  const content = body?.content?.trim();
  if (!content) return NextResponse.json({ error: "投稿本文は必須です" }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: ".env に OPENAI_API_KEY を設定してください" }, { status: 503 });

  const summary = await summarizeTweet(content);
  if (!summary) return NextResponse.json({ error: "要約を作成できませんでした" }, { status: 502 });
  return NextResponse.json({ summary });
}
