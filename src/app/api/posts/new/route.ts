import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const posts = await prisma.post.findMany({
    where: { userId, isNew: true },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      companyId: p.companyId,
      companyName: p.company?.name ?? null,
      source: p.source,
      title: p.title,
      content: p.content,
      author: p.author,
      aiSummary: p.aiSummary,
      matchedKeywords: p.matchedKeywords,
      url: p.url,
      postedAt: p.postedAt,
      createdAt: p.createdAt
    }))
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const userId: string | undefined = body?.userId;
  const postIds: string[] | undefined = body?.postIds;

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const result = await prisma.post.updateMany({
    where: {
      userId,
      isNew: true,
      ...(postIds && postIds.length > 0 ? { id: { in: postIds } } : {})
    },
    data: { isNew: false }
  });

  return NextResponse.json({ updated: result.count });
}
