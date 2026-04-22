import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchKeywords } from '@/lib/x-keywords';
import { summarizeTweet } from '@/lib/ai/summarize';

export const dynamic = 'force-dynamic';

type ImportBody = {
  userId?: string;
  tweetId?: string;
  url?: string;
  authorHandle?: string;
  authorName?: string;
  text?: string;
  timestamp?: string;
  companyId?: string | null;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ImportBody | null;
  if (!body) {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const { userId, tweetId, url, authorHandle, authorName, text, timestamp } = body;
  if (!userId || !tweetId || !text) {
    return NextResponse.json(
      { error: 'userId, tweetId, text are required' },
      { status: 400 }
    );
  }

  const keywords = matchKeywords(text);

  let aiSummary: string | null = null;
  try {
    aiSummary = await summarizeTweet(text);
  } catch {
    aiSummary = null;
  }

  const postedAt = timestamp ? new Date(timestamp) : new Date();
  const safePostedAt = isNaN(postedAt.getTime()) ? new Date() : postedAt;

  try {
    const post = await prisma.post.create({
      data: {
        userId,
        companyId: body.companyId ?? null,
        source: 'X',
        externalId: tweetId,
        url: url ?? null,
        title: authorName ? `${authorName} (@${authorHandle ?? ''})` : null,
        content: text,
        author: authorHandle ?? null,
        postedAt: safePostedAt,
        aiSummary,
        matchedKeywords: keywords.length > 0 ? keywords : undefined,
        isNew: true
      }
    });
    return NextResponse.json({ post });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes('unique')) {
      return NextResponse.json({ error: 'このツイートは既に取り込み済みです' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
