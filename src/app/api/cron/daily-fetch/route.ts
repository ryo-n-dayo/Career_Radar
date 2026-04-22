import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchSiteHash } from '@/lib/fetchers/officialSite';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type FetchSummary = {
  companyId: string;
  companyName: string;
  url: string;
  status: 'unchanged' | 'changed' | 'error' | 'skipped';
  error?: string;
  postsCreated?: number;
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

  const favorites = await prisma.favoriteCompany.findMany({
    include: { company: true }
  });

  const companyMap = new Map<string, { company: typeof favorites[number]['company']; userIds: string[] }>();
  for (const fav of favorites) {
    const entry = companyMap.get(fav.companyId);
    if (entry) {
      entry.userIds.push(fav.userId);
    } else {
      companyMap.set(fav.companyId, { company: fav.company, userIds: [fav.userId] });
    }
  }

  const summaries: FetchSummary[] = [];

  for (const { company, userIds } of companyMap.values()) {
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

    let created = 0;
    for (const userId of userIds) {
      try {
        await prisma.post.create({
          data: {
            userId,
            companyId: company.id,
            source: 'WEB',
            url,
            title: `${company.name} 採用ページが更新されました`,
            postedAt: new Date(),
            externalId: `${userId}_${company.id}_${result.hash}`,
            isNew: true
          }
        });
        created += 1;
      } catch {
        // unique constraint → already recorded, skip
      }
    }

    summaries.push({
      companyId: company.id,
      companyName: company.name,
      url,
      status: 'changed',
      postsCreated: created
    });
  }

  return NextResponse.json({
    ranAt: new Date().toISOString(),
    total: summaries.length,
    summaries
  });
}
