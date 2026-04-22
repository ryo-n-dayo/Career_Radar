import { PrismaClient, EventCategory, EventStatus, PostSource, ModerationStatus } from "@prisma/client";

const prisma = new PrismaClient();

type SeedEventBase = {
  id: string;
  companyId: string;
  category: EventCategory;
  title: string;
  content?: string;
  status: EventStatus;
};

type SeedEventWithDeadline = SeedEventBase & {
  deadline: Date;
  startsAt?: never;
  endsAt?: never;
};

type SeedEventWithSchedule = SeedEventBase & {
  startsAt: Date;
  endsAt: Date;
  deadline?: never;
};

type SeedEvent = SeedEventWithDeadline | SeedEventWithSchedule;

type SeedPost = {
  id: string;
  companyId: string;
  source: PostSource;
  url?: string;
  title?: string;
  content?: string;
  postedAt?: Date;
  externalId?: string;
  author?: string;
};

async function main() {
  // 1) User (seed用)
  const user = await prisma.user.upsert({
    where: { email: "seed@example.com" },
    update: {},
    create: {
      id: "user_seed",
      email: "seed@example.com",
      name: "Seed User"
    }
  });

  // 2) Companies (10社)
  const companies = [
    {
      id: "co_01",
      name: "株式会社サンプルテック",
      industry: "SaaS",
      officialUrl: "https://example.com/sample-tech"
    },
    {
      id: "co_02",
      name: "Example Consulting",
      industry: "コンサル",
      officialUrl: "https://example.com/example-consulting"
    },
    {
      id: "co_03",
      name: "株式会社メディアラボ",
      industry: "メディア",
      officialUrl: "https://example.com/media-lab"
    },
    {
      id: "co_04",
      name: "Sunrise FinTech",
      industry: "FinTech",
      officialUrl: "https://example.com/sunrise-fintech"
    },
    {
      id: "co_05",
      name: "Green Mobility",
      industry: "モビリティ",
      officialUrl: "https://example.com/green-mobility"
    },
    {
      id: "co_06",
      name: "Neon Games",
      industry: "ゲーム",
      officialUrl: "https://example.com/neon-games"
    },
    {
      id: "co_07",
      name: "Atlas Manufacturing",
      industry: "製造DX",
      officialUrl: "https://example.com/atlas-manufacturing"
    },
    {
      id: "co_08",
      name: "Cloud Note",
      industry: "プロダクト",
      officialUrl: "https://example.com/cloud-note"
    },
    {
      id: "co_09",
      name: "Open Education",
      industry: "EdTech",
      officialUrl: "https://example.com/open-education"
    },
    {
      id: "co_10",
      name: "Secure Stack",
      industry: "セキュリティ",
      officialUrl: "https://example.com/secure-stack"
    }
  ] as const;

  for (const c of companies) {
    await prisma.company.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        industry: c.industry,
        officialUrl: c.officialUrl
      },
      create: c
    });
  }

  // 3) Favorite（適当に数社）
  const favCompanyIds = ["co_01", "co_02", "co_08"];
  for (const companyId of favCompanyIds) {
    await prisma.favoriteCompany.upsert({
      where: { userId_companyId: { userId: user.id, companyId } },
      update: {},
      create: {
        id: `fav_${user.id}_${companyId}`,
        userId: user.id,
        companyId
      }
    });
  }

  // 4) Posts（各社1件ずつ程度）
  const posts: SeedPost[] = [
    {
      id: "post_01",
      companyId: "co_01",
      source: PostSource.WEB,
      title: "サマーインターン募集開始",
      url: "https://example.com/sample-tech/intern",
      content: "Web/AIコースの募集を開始しました。",
      postedAt: new Date("2026-04-18T03:00:00.000Z")
    },
    {
      id: "post_02",
      companyId: "co_02",
      source: PostSource.LINKEDIN,
      externalId: "ln_early_2026",
      title: "早期選考ルートの案内",
      url: "https://example.com/example-consulting/early",
      content: "説明会参加者向けに早期選考をご案内します。",
      postedAt: new Date("2026-04-15T03:00:00.000Z")
    },
    {
      id: "post_03",
      companyId: "co_03",
      source: PostSource.X,
      externalId: "x_12345",
      title: "オンライン会社説明会",
      url: "https://example.com/media-lab/session",
      content: "エンジニア職向けオンライン説明会を開催します。",
      postedAt: new Date("2026-04-16T03:00:00.000Z")
    },
    {
      id: "post_04",
      companyId: "co_08",
      source: PostSource.X,
      externalId: "x_54321",
      title: "ポートフォリオ必須の早期選考",
      url: "https://example.com/cloud-note/early",
      content: "プロダクト職の早期選考。ポートフォリオ必須です。",
      postedAt: new Date("2026-04-19T03:00:00.000Z")
    }
  ];

  for (const p of posts) {
    await prisma.post.upsert({
      where: { id: p.id },
      update: {
        title: p.title,
        content: p.content,
        url: p.url,
        postedAt: p.postedAt,
        source: p.source,
        externalId: p.externalId ?? null,
        author: p.author ?? null
      },
      create: {
        ...p,
        userId: user.id
      }
    });
  }

  // 5) Events（締切/日時/ステータス）
  const events = [
    {
      id: "evt_01",
      companyId: "co_01",
      category: EventCategory.INTERN,
      title: "サマーインターン締切",
      content: "エントリー締切",
      deadline: new Date("2026-05-10T14:59:59.000Z"),
      status: EventStatus.TODO
    },
    {
      id: "evt_02",
      companyId: "co_02",
      category: EventCategory.EARLY_SELECTION,
      title: "早期選考エントリー締切",
      content: "説明会参加者向け",
      deadline: new Date("2026-04-28T14:59:59.000Z"),
      status: EventStatus.BOOKMARKED
    },
    {
      id: "evt_03",
      companyId: "co_03",
      category: EventCategory.INFO_SESSION,
      title: "オンライン会社説明会",
      content: "Zoom開催",
      startsAt: new Date("2026-04-25T10:00:00.000Z"),
      endsAt: new Date("2026-04-25T11:00:00.000Z"),
      status: EventStatus.TODO
    },
    {
      id: "evt_04",
      companyId: "co_08",
      category: EventCategory.EARLY_SELECTION,
      title: "ポートフォリオ提出締切",
      content: "提出後、面談日程を案内",
      deadline: new Date("2026-04-27T14:59:59.000Z"),
      status: EventStatus.APPLIED
    }
  ] satisfies SeedEvent[];

  for (const e of events) {
    await prisma.event.upsert({
      where: { id: e.id },
      update: {
        title: e.title,
        content: e.content ?? null,
        category: e.category,
        startsAt: "startsAt" in e ? e.startsAt : null,
        endsAt: "endsAt" in e ? e.endsAt : null,
        deadline: "deadline" in e ? e.deadline : null,
        status: e.status
      },
      create: {
        ...e,
        userId: user.id
      }
    });
  }

  // 6) AIAnalysis（時系列）
  await prisma.aIAnalysis.createMany({
    data: [
      {
        id: "ai_01",
        userId: user.id,
        companyId: "co_01",
        analyzedAt: new Date("2026-04-10T00:00:00.000Z"),
        heatScore: 78,
        keywords: ["裁量", "成長", "技術"],
        summary: "インターン文脈で技術志向が強い。"
      },
      {
        id: "ai_02",
        userId: user.id,
        companyId: "co_01",
        analyzedAt: new Date("2026-04-18T00:00:00.000Z"),
        heatScore: 95,
        keywords: ["裁量", "成長", "技術ブログ"],
        summary: "募集開始で熱量が上昇。"
      }
    ],
  });

  // 7) WikiEntry（Moderation付き）
  await prisma.wikiEntry.upsert({
    where: { id: "wiki_01" },
    update: {},
    create: {
      id: "wiki_01",
      userId: user.id,
      companyId: "co_01",
      title: "選考メモ",
      content: "一次はコーディングテスト中心。技術ブログの話題が出た。",
      moderationStatus: ModerationStatus.APPROVED,
      moderatedAt: new Date("2026-04-20T00:00:00.000Z")
    }
  });

  // 8) ES Draft（引用IDを文字列として保持）
  await prisma.eSDraft.upsert({
    where: { id: "es_01" },
    update: {},
    create: {
      id: "es_01",
      userId: user.id,
      companyId: "co_01",
      title: "志望動機（下書き）",
      content: "技術×裁量の環境で成長したい。インターンで価値提供したい。",
      citedPostIds: ["post_01"],
      citedEventIds: ["evt_01"],
      citedWikiIds: ["wiki_01"]
    }
  });

  const counts = {
    users: await prisma.user.count(),
    companies: await prisma.company.count(),
    posts: await prisma.post.count(),
    events: await prisma.event.count(),
    analyses: await prisma.aIAnalysis.count(),
    wiki: await prisma.wikiEntry.count(),
    esDrafts: await prisma.eSDraft.count(),
    favorites: await prisma.favoriteCompany.count()
  };

  // eslint-disable-next-line no-console
  console.log("[seed] done", counts);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

