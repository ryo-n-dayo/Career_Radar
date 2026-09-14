import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function at(daysFromNow: number, hour = 10): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function main() {
  // MeetupPlanにはダミーの興味やメモを作らない。本人の操作だけで作成し、再seedでも上書きしない。
  const sampleCompany = await prisma.company.upsert({
    where: { name: "サンプルテック株式会社" },
    create: {
      name: "サンプルテック株式会社",
      website: "https://example.com/sample-tech",
      industry: "ソフトウェア",
      summary: "プロダクト開発と技術イベントを行うサンプル企業です。",
      memo: "気になる技術発信と募集情報をまとめて確認する。",
      tags: ["SaaS", "開発組織"]
    },
    update: {}
  });

  await prisma.savedPost.upsert({
    where: { url: "https://x.com/example/status/1000000000000000000" },
    create: {
      url: "https://x.com/example/status/1000000000000000000",
      author: "サンプルテック開発チーム",
      account: "@example",
      content: "新しい開発者向けイベントを開催します。プロダクト開発の裏側と、チームで大切にしていることを紹介します。",
      summary: "開発組織の考え方とプロダクト開発事例を紹介するイベント告知。",
      tags: ["開発組織", "イベント"],
      companyId: sampleCompany.id
    },
    update: { companyId: sampleCompany.id }
  });

  await prisma.event.upsert({
    where: { url: "https://example.com/sample-events/product-meetup" },
    create: {
      url: "https://example.com/sample-events/product-meetup",
      ingestSource: "MANUAL",
      title: "【サンプル】プロダクト開発ミートアップ",
      description: "開発チームの事例を聞き、次に調べたいことを整理するためのサンプル予定です。",
      kind: "MEETUP",
      format: "HYBRID",
      prefecture: "東京都",
      venue: "オンライン / サンプルオフィス",
      startsAt: at(7, 19),
      endsAt: at(7, 21),
      applyDeadline: at(5, 23),
      organizer: sampleCompany.name,
      organizerUrl: sampleCompany.website,
      tags: ["プロダクト", "開発組織"],
      companyId: sampleCompany.id
    },
    update: { companyId: sampleCompany.id }
  });

  const [companies, posts, events] = await Promise.all([
    prisma.company.count(),
    prisma.savedPost.count(),
    prisma.event.count()
  ]);
  console.log(`seed 完了: 企業 ${companies} / X投稿 ${posts} / イベント ${events}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
