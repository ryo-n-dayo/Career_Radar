import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchSiteHash } from '@/lib/fetchers/officialSite';
import { extractEventInfo } from '@/lib/ai/extractEventInfo';
import { DEFAULT_USER_ID, ensureDefaultUser } from '@/lib/defaultUser';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type FetchSummary = {
  companyId: string;
  companyName: string;
  url: string;
  status: 'unchanged' | 'changed' | 'error' | 'skipped';
  error?: string;
  postCreated?: boolean;
  eventUpdated?: boolean;
};

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureDefaultUser();

  // 対象: 全企業（お気に入りに限定しない）
  const companies = await prisma.company.findMany();

  const summaries: FetchSummary[] = [];

  for (const company of companies) {
    const url = company.careersUrl ?? company.officialUrl;
    if (!url) {
      summaries.push({
        companyId: company.id,
        companyName: company.name,
        url: '',
        status: 'skipped',
        error: 'no URL'
      });
      continue;
    }

    const result = await fetchSiteHash(url, company.lastFetchedHash);

    if (result.status === 'error') {
      summaries.push({
        companyId: company.id,
        companyName: company.name,
        url,
        status: 'error',
        error: result.error
      });
      continue;
    }

    await prisma.company.update({
      where: { id: company.id },
      data: { lastFetchedHash: result.hash, lastFetchedAt: new Date() }
    });

    if (result.status === 'unchanged') {
      summaries.push({ companyId: company.id, companyName: company.name, url, status: 'unchanged' });
      continue;
    }

    // changed: 新着Postを作成
    let postCreated = false;
    try {
      await prisma.post.create({
        data: {
          userId: DEFAULT_USER_ID,
          companyId: company.id,
          source: 'WEB',
          url,
          title: `${company.name} 採用ページが更新されました`,
          postedAt: new Date(),
          externalId: `${DEFAULT_USER_ID}_${company.id}_${result.hash}`,
          isNew: true
        }
      });
      postCreated = true;
    } catch {
      // unique constraint → already recorded
    }

    // 変更検知時のみAIで締切・カテゴリを抽出し、直近のEventを更新（コスト抑制のため変更時のみ実行）
    let eventUpdated = false;
    const extracted = await extractEventInfo(company.name, result.html);
    if (extracted) {
      const targetEvent = await prisma.event.findFirst({
        where: { companyId: company.id, userId: DEFAULT_USER_ID },
        orderBy: { deadline: 'asc' }
      });

      if (targetEvent) {
        await prisma.event.update({
          where: { id: targetEvent.id },
          data: {
            deadline: extracted.deadline ? new Date(extracted.deadline) : targetEvent.deadline,
            deadlineLabel: extracted.deadlineLabel ?? targetEvent.deadlineLabel,
            content: extracted.summary ?? targetEvent.content,
            trust: 'needs_review'
          }
        });
        eventUpdated = true;
      }
    }

    summaries.push({
      companyId: company.id,
      companyName: company.name,
      url,
      status: 'changed',
      postCreated,
      eventUpdated
    });
  }

  return NextResponse.json({
    ranAt: new Date().toISOString(),
    total: summaries.length,
    summaries
  });
}
