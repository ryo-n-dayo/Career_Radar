export type CandidateKind = "INTERNSHIP" | "RECRUIT" | "EVENT" | "LEARNING_BENEFIT" | "COMPANY_UPDATE";

type ScoreResult = {
  kind: CandidateKind;
  score: number;
  reasons: string[];
  deadline?: Date;
};

const GROUPS: Array<{ label: string; pattern: RegExp; points: number; kind: CandidateKind }> = [
  { label: "技術学習特典", pattern: /(?:aws|azure|gcp|google\s*cloud|microsoft|cisco|comptia|linux|kubernetes|cka|資格|認定|certif(?:ication)?|試験|training|トレーニング).{0,90}(?:割引|無料|無償|クーポン|バウチャー|キャンペーン|特典|受験料|半額|50\s*%|free\s+retake|discount|voucher|offer)|(?:割引|無料|無償|クーポン|バウチャー|キャンペーン|特典|受験料|半額|50\s*%|free\s+retake|discount|voucher|offer).{0,90}(?:aws|azure|gcp|google\s*cloud|microsoft|cisco|comptia|linux|kubernetes|cka|資格|認定|certif(?:ication)?|試験|training|トレーニング)/i, points: 46, kind: "LEARNING_BENEFIT" },
  { label: "インターン", pattern: /インターン|intern(ship)?/i, points: 45, kind: "INTERNSHIP" },
  { label: "採用・募集", pattern: /採用|募集|求人|エントリー|選考|join\s*us|career|recruit/i, points: 28, kind: "RECRUIT" },
  { label: "イベント", pattern: /イベント|説明会|登壇|交流会|ミートアップ|meetup|seminar|セミナー|hackathon|ハッカソン/i, points: 25, kind: "EVENT" },
  { label: "締切・先着", pattern: /締切|〆切|本日中|先着|若干名|追加募集|残り\d+|定員/i, points: 24, kind: "RECRUIT" }
];

const TECHNICAL_ROLE = /エンジニア|ソフトウェア|開発|プログラミング|フロントエンド|バックエンド|インフラ|sre|セキュリティ|データ(?:分析|サイエンス|基盤)?|ai|人工知能|機械学習|llm|クラウド|(?:ソリューション|システム|cloud\s*)?アーキテクト|aws|azure|gcp|google\s*cloud|github|gitlab|vercel|kubernetes|linux|docker|ios|android|ui\s*\/\s*ux/i;
const NON_TECHNICAL_ROLE = /営業|セールス|販売|接客|マーケティング|広報|人事|総務|経理|法務|コンサル(?:タント)?|カスタマーサクセス|ビジネス職|business\s*(?:role|position)?/i;
const TECH_LEARNING_SIGNAL = /aws|azure|gcp|google\s*cloud|microsoft|cisco|comptia|linux|kubernetes|cka|資格|認定|certif(?:ication)?|試験|training|トレーニング/i;
const LEARNING_BENEFIT_SIGNAL = /割引|無料|無償|クーポン|バウチャー|キャンペーン|特典|受験料|半額|50\s*%|free\s+retake|discount|voucher|offer/i;
const TECH_UPDATE_SIGNAL = /新機能|新サービス|リリース|提供開始|アップデート|公開|発表|障害|脆弱性|セキュリティ(?:更新|情報)?|サポート(?:開始|追加)?|利用可能|release|launch|update|announc(?:e|ement)|security\s+(?:update|advisory)|changelog|now\s+supports?|available\s+now/i;
const NEW_GRAD_SIGNAL = /新卒|新規学卒|既卒|第二新卒|20(?:2[7-9]|3\d)\s*年?卒|(?:new|recent)\s*grad(?:uate)?/i;
const RECRUITING_SIGNAL = /採用|募集|求人|エントリー|応募|選考|正社員|entry|apply|career|recruit/i;

/**
 * 「2028年9月までに学位取得見込み（2028年卒）」と、2029年卒以降を対象にする。
 * 「2028年卒」だけでは卒業時期を判定できないため通さないが、9月までの学位取得見込みが明記されれば通す。
 */
export function isEligibleGraduationWindow(text: string): boolean {
  const value = text.normalize("NFKC");
  if (/2028\s*年?\s*9\s*月\s*(?:までに|迄に).{0,100}(?:学士|修士|博士|学位).{0,100}(?:取得|卒業|修了).{0,80}(?:見込み|予定)/i.test(value)) return true;
  if (/2028\s*年?\s*(?:9|10|11|12)\s*月\s*(?:卒業|卒|修了|graduat)|(?:sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s*2028\s*(?:graduate|graduation)?/i.test(value)) return true;
  const years = [...value.matchAll(/(20\d{2})\s*(?:年?\s*卒|graduates?)/gi)].map((match) => Number(match[1]));
  return years.some((year) => year >= 2029);
}

/** IT・エンジニア職のインターンだけを、公式採用ページ用の候補として通す。 */
export function isEngineeringInternship(text: string): boolean {
  return /インターン|intern(ship)?/i.test(text) && TECHNICAL_ROLE.test(text) && !NON_TECHNICAL_ROLE.test(text);
}

/** 技術職に限った新卒・既卒向けの公式募集だけを、就活ページ用に通す。 */
export function isEngineeringNewGraduate(text: string): boolean {
  return NEW_GRAD_SIGNAL.test(text) && RECRUITING_SIGNAL.test(text) && TECHNICAL_ROLE.test(text) && !NON_TECHNICAL_ROLE.test(text) && isEligibleGraduationWindow(text);
}

/** 資格・技術学習に直接使える、期間限定の割引・無償受験などだけを通す。 */
export function isTechLearningBenefit(text: string): boolean {
  return TECH_LEARNING_SIGNAL.test(text) && LEARNING_BENEFIT_SIGNAL.test(text);
}

/** 公式の技術情報として価値がある、資格特典または製品・セキュリティ更新を通す。 */
export function isUsefulITNews(text: string): boolean {
  return isTechLearningBenefit(text) || (TECHNICAL_ROLE.test(text) && TECH_UPDATE_SIGNAL.test(text));
}

function parseJapaneseDeadline(text: string, now: Date): Date | undefined {
  const full = text.match(/(20\d{2})\s*[年/.\-]\s*(\d{1,2})\s*[月/.\-]\s*(\d{1,2})\s*日?(?:\s*(\d{1,2})\s*[:時]\s*(\d{2})?)?/);
  if (full) {
    const date = new Date(Number(full[1]), Number(full[2]) - 1, Number(full[3]), Number(full[4] ?? 23), Number(full[5] ?? 59));
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const short = text.match(/(\d{1,2})\s*[月/.]\s*(\d{1,2})\s*日?(?:\s*(\d{1,2})\s*[:時]\s*(\d{2})?)?/);
  if (!short) return undefined;
  let year = now.getFullYear();
  const date = new Date(year, Number(short[1]) - 1, Number(short[2]), Number(short[3] ?? 23), Number(short[4] ?? 59));
  if (date.getTime() < now.getTime() - 14 * 86_400_000) {
    year += 1;
    date.setFullYear(year);
  }
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function scoreCandidate(input: { title: string; summary?: string; publishedAt?: Date; now?: Date }): ScoreResult {
  const now = input.now ?? new Date();
  const text = `${input.title} ${input.summary ?? ""}`;
  const reasons: string[] = [];
  let score = 0;
  let kind: CandidateKind = "COMPANY_UPDATE";
  let strongest = 0;

  for (const group of GROUPS) {
    if (!group.pattern.test(text)) continue;
    score += group.points;
    reasons.push(group.label);
    if (group.points > strongest && group.label !== "締切・先着") {
      kind = group.kind;
      strongest = group.points;
    }
  }

  if (isEngineeringInternship(text)) {
    score += 18;
    reasons.push("IT・エンジニア職");
  }
  if (isEngineeringNewGraduate(text)) {
    score += 18;
    reasons.push("技術職の新卒・既卒募集");
  }

  const deadline = parseJapaneseDeadline(text, now);
  if (deadline) {
    const remaining = deadline.getTime() - now.getTime();
    if (remaining >= 0 && remaining <= 48 * 60 * 60 * 1000) {
      score += 30;
      reasons.push("48時間以内");
    } else if (remaining > 0 && remaining <= 7 * 86_400_000) {
      score += 15;
      reasons.push("7日以内");
    }
  }

  if (input.publishedAt && now.getTime() - input.publishedAt.getTime() <= 24 * 60 * 60 * 1000) {
    score += 12;
    reasons.push("24時間以内の掲載");
  }

  return { kind, score: Math.min(score, 100), reasons: [...new Set(reasons)], deadline };
}

export function looksRelevant(text: string): boolean {
  return GROUPS.some((group) => group.pattern.test(text));
}
