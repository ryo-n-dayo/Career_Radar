import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchHatena, fetchGNews, fetchQiita, fetchZenn } from "@/features/news/fetchers";
import { summarizeAndClassify } from "@/features/news/categorize";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const gnewsKey = process.env.GNEWS_API_KEY;

  const [hatenaArticles, gnewsArticles, qiitaArticles, zennArticles] = await Promise.all([
    fetchHatena().catch(() => []),
    gnewsKey ? fetchGNews(gnewsKey).catch(() => []) : Promise.resolve([]),
    fetchQiita().catch(() => []),
    fetchZenn().catch(() => []),
  ]);

  const allArticles = [...hatenaArticles, ...gnewsArticles, ...qiitaArticles, ...zennArticles];
  const fetched = allArticles.length;

  // Dedupe within this batch (same URL may appear across fetchers or repeat within one source).
  const uniqueByUrl = new Map<string, (typeof allArticles)[number]>();
  for (const a of allArticles) {
    if (!uniqueByUrl.has(a.url)) uniqueByUrl.set(a.url, a);
  }
  const uniqueArticles = [...uniqueByUrl.values()];

  // Batch-check which URLs already exist (single query instead of N findUnique calls).
  const existing = await prisma.newsArticle.findMany({
    where: { url: { in: uniqueArticles.map((a) => a.url) } },
    select: { url: true },
  });
  const existingUrls = new Set(existing.map((e) => e.url));
  const newArticles = uniqueArticles.filter((a) => !existingUrls.has(a.url));

  // Parallelise Claude summarisation across new articles; failures fall back inside the helper.
  const enriched = await Promise.all(
    newArticles.map(async (article) => ({
      article,
      ...(await summarizeAndClassify(article)),
    }))
  );

  if (enriched.length > 0) {
    await prisma.newsArticle.createMany({
      data: enriched.map(({ article, summary, category }) => ({
        title: article.title,
        summary,
        url: article.url,
        source: article.source,
        category,
        publishedAt: article.publishedAt,
        imageUrl: article.imageUrl ?? null,
      })),
    });
  }

  const cutoff = new Date(Date.now() - 30 * 86400_000);
  await prisma.newsArticle.deleteMany({ where: { publishedAt: { lt: cutoff } } });

  return NextResponse.json({
    ranAt: new Date().toISOString(),
    fetched,
    saved: enriched.length,
    skipped: uniqueArticles.length - enriched.length,
    duplicatesInBatch: allArticles.length - uniqueArticles.length,
    sources: {
      hatena: hatenaArticles.length,
      gnews: gnewsArticles.length,
      qiita: qiitaArticles.length,
      zenn: zennArticles.length,
    },
  });
}
