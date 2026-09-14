import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { applyInterestProfile } from "@/features/sources/preferences";
import { scoreCandidate } from "@/features/sources/scoring";
import { getInterestProfile } from "@/features/sources/server/interestProfile";
import { prisma } from "@/lib/prisma";

const SAMPLE_SOURCE_URL = "https://dailynews.local/practice-samples";

type PracticeSample = {
  title: string;
  summary: string;
};

/** 実在の企業・募集ではない、興味度の初期調整専用のデータ。 */
const PRACTICE_SAMPLES: PracticeSample[] = [
  { title: "【練習用】生成AIプロダクトの長期インターン募集", summary: "架空のSaaSチームで、生成AIを使ったプロダクト企画・検証に関わる長期インターンです。週2日から、学生歓迎。" },
  { title: "【練習用】海外展開チームの学生インターン", summary: "架空のスタートアップによる海外市場リサーチと英語でのユーザー調査。事業開発に興味がある学生向けです。" },
  { title: "【練習用】マレーシア市場リサーチ・インターン", summary: "東南アジア、とくにマレーシアでの新規事業を調べる架空のリサーチインターン。オンライン面談あり。" },
  { title: "【練習用】AI×教育のプロダクト開発イベント", summary: "教育領域の課題をテーマに、学生と社会人がアイデアを形にする一日完結の架空イベントです。" },
  { title: "【練習用】エンジニア向け会社説明会（対面）", summary: "架空のソフトウェア企業による少人数の会社説明会。現場エンジニアとの座談会とオフィス見学を行います。" },
  { title: "【練習用】営業職向け新卒一括採用", summary: "架空の人材企業による新卒一括採用の募集です。法人営業志望者向けの説明会を案内します。" },
  { title: "【練習用】オンラインのみの短期セミナー", summary: "就職活動の基礎を扱う架空のオンラインセミナー。90分で完結し、録画配信も予定しています。" },
  { title: "【練習用】起業・VCリサーチの長期インターン", summary: "スタートアップとベンチャーキャピタルの動向を調べ、投資先候補のリサーチを行う架空の長期インターンです。" },
  { title: "【練習用】データ分析インターン・締切間近", summary: "架空のデータチームでSQLと分析ダッシュボードを扱う学生インターン。応募締切は今週です。" },
  { title: "【練習用】地域連携イベントの運営スタッフ募集", summary: "地域企業と学生をつなぐ架空イベントの運営メンバーを募集。企画、広報、当日運営を体験できます。" }
];

export async function POST() {
  const [source, profile] = await Promise.all([
    prisma.watchSource.upsert({
      where: { url: SAMPLE_SOURCE_URL },
      update: {},
      create: {
        name: "DailyNews 練習用サンプル",
        url: SAMPLE_SOURCE_URL,
        kind: "DEMO",
        enabled: false,
        confirmedAt: new Date(),
        notes: "実在しない練習用データ。興味度の初期調整だけに使います。",
        lastStatus: "DEMO"
      }
    }),
    getInterestProfile()
  ]);

  let created = 0;
  for (const [index, sample] of PRACTICE_SAMPLES.entries()) {
    const url = `${SAMPLE_SOURCE_URL}/${String(index + 1).padStart(2, "0")}`;
    const contentHash = createHash("sha256").update(`${sample.title}\n${sample.summary}`).digest("hex");
    const exists = await prisma.candidate.findUnique({
      where: { sourceId_url_contentHash: { sourceId: source.id, url, contentHash } },
      select: { id: true }
    });
    if (exists) continue;

    const scored = scoreCandidate({ title: sample.title, summary: sample.summary });
    const personalized = applyInterestProfile({
      baseScore: scored.score,
      text: `${sample.title}\n${sample.summary}`,
      profile
    });
    await prisma.candidate.create({
      data: {
        sourceId: source.id,
        url,
        title: sample.title,
        summary: sample.summary,
        kind: scored.kind,
        score: personalized.score,
        reasons: [...new Set([...scored.reasons, ...personalized.reasons, "練習用"])],
        deadline: scored.deadline,
        contentHash
      }
    });
    created += 1;
  }

  revalidatePath("/");
  revalidatePath("/sources");
  return NextResponse.json({ created, total: PRACTICE_SAMPLES.length });
}
