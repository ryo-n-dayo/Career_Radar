import { containsInterestTerm } from "@/lib/textMatch";

export type FeedbackExample = {
  sourceId: string;
  text: string;
  relevant: boolean;
  value?: number | null;
  reason?: string | null;
};

export type LearningContribution = {
  kind: "source" | "signal";
  key: string;
  observations: number;
  probability: number;
  confidence: number;
  points: number;
};

export type LearnedScore = {
  score: number;
  reasons: string[];
  contributions?: LearningContribution[];
};

export type LearningProfile = {
  feedbackCount: number;
  alpha: number;
  globalProbability: number;
  sources: LearningContribution[];
  signals: LearningContribution[];
};

/** Eight virtual neutral evaluations keep one accidental tap from dominating the feed. */
export const LEARNING_SMOOTHING_ALPHA = 8;
export const MIN_LEARNING_EXAMPLES = 5;

export const X_QUERY_SIGNALS = [
  "生成AI", "AI", "長期インターン", "インターン", "海外", "マレーシア", "英語",
  "スタートアップ", "起業", "VC", "データ分析", "エンジニア", "教育", "説明会",
  "イベント", "ハッカソン", "採用", "募集", "新卒", "営業", "オンライン"
] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** -2..+2 を、確率モデルで扱える 0..1 の弱い報酬にする。 */
export function feedbackReward(example: FeedbackExample): number {
  const value = clamp(example.value ?? (example.relevant ? 1 : -1), -2, 2);
  return (value + 2) / 4;
}

/**
 * 任意の文章断片ではなく、説明できる少数の話題だけを特徴量にする。
 * 英字の境界判定は textMatch に任せるので email 内の AI のような誤一致も避ける。
 */
export function extractLearningSignals(text: string): string[] {
  return X_QUERY_SIGNALS.filter((signal) => containsInterestTerm(text, signal));
}

/** 「営業向け、初心者向け」のような興味なし理由を、説明可能な個人シグナルとして扱う。 */
export function extractFeedbackReasonTerms(reason?: string | null): string[] {
  if (!reason) return [];
  return [...new Set(reason.normalize("NFKC")
    .split(/[\n,、，;；・/／.。！？!?]/)
    .map((term) => term.trim().replace(/\s+/g, " "))
    .filter((term) => term.length >= 2 && term.length <= 80))].slice(0, 8);
}

function extractExampleSignals(example: FeedbackExample): string[] {
  return [...new Set([...extractLearningSignals(example.text), ...extractFeedbackReasonTerms(example.reason)])];
}

function evidence(examples: FeedbackExample[], predicate: (example: FeedbackExample) => boolean, globalProbability: number, key: string, kind: LearningContribution["kind"], maxPoints: number): LearningContribution {
  const matches = examples.filter(predicate);
  const observations = matches.length;
  const rewardSum = matches.reduce((sum, example) => sum + feedbackReward(example), 0);
  // Beta prior: feature probability is pulled toward the user's overall preference.
  const probability = (rewardSum + LEARNING_SMOOTHING_ALPHA * globalProbability) / (observations + LEARNING_SMOOTHING_ALPHA);
  const confidence = observations / (observations + LEARNING_SMOOTHING_ALPHA);
  const affinity = (probability - globalProbability) * 2;
  return { kind, key, observations, probability, confidence, points: Math.round(clamp(affinity * maxPoints, -maxPoints, maxPoints)) };
}

/** Local, explainable Bayesian model rebuilt from SQLite feedback on every scan. */
export function buildLearningProfile(examples: FeedbackExample[]): LearningProfile {
  const feedbackCount = examples.length;
  const rewardTotal = examples.reduce((sum, example) => sum + feedbackReward(example), 0);
  const globalProbability = (rewardTotal + LEARNING_SMOOTHING_ALPHA * 0.5) / (feedbackCount + LEARNING_SMOOTHING_ALPHA);
  const sourceIds = [...new Set(examples.map((example) => example.sourceId))];
  const signalKeys = [...new Set(examples.flatMap(extractExampleSignals))];
  const sources = sourceIds.map((sourceId) => evidence(examples, (example) => example.sourceId === sourceId, globalProbability, sourceId, "source", 24));
  const signals = signalKeys.map((signal) => evidence(examples, (example) => extractExampleSignals(example).includes(signal), globalProbability, signal, "signal", 8));
  return { feedbackCount, alpha: LEARNING_SMOOTHING_ALPHA, globalProbability, sources, signals };
}

/**
 * Candidate score = rule score + source affinity + topic affinities.
 * Small samples remain close to the global probability through the Beta prior.
 */
export function applyLearning(input: {
  baseScore: number;
  sourceId: string;
  text: string;
  examples: FeedbackExample[];
}): LearnedScore {
  if (input.examples.length < MIN_LEARNING_EXAMPLES) return { score: input.baseScore, reasons: [] };

  const profile = buildLearningProfile(input.examples);
  const contributions: LearningContribution[] = [];
  const source = profile.sources.find((item) => item.key === input.sourceId);
  if (source && source.observations >= 2 && source.points !== 0) contributions.push(source);

  const signalContributions = profile.signals
    .filter((item) => containsInterestTerm(input.text, item.key) && item.observations >= 1 && item.points !== 0)
    .sort((left, right) => Math.abs(right.points) - Math.abs(left.points) || right.observations - left.observations)
    .slice(0, 4);
  contributions.push(...signalContributions);

  const sourceAdjustment = source && source.observations >= 2 ? source.points : 0;
  const signalAdjustment = clamp(signalContributions.reduce((sum, item) => sum + item.points, 0), -18, 18);
  const adjustment = sourceAdjustment + signalAdjustment;
  const reasons: string[] = [];
  if (sourceAdjustment >= 3) reasons.push("この情報源の保存実績");
  if (sourceAdjustment <= -3) reasons.push("この情報源の不要判定実績");
  if (signalAdjustment >= 3) reasons.push("過去に役立った話題");
  if (signalAdjustment <= -3) reasons.push("過去に不要だった話題");

  return { score: clamp(input.baseScore + adjustment, 0, 100), reasons, contributions };
}

/**
 * 興味度の履歴から、公式X APIの検索語を少数だけ選ぶ。
 * 検索語にも同じ平滑化を使い、一件だけの偶然の評価で監視対象を増やさない。
 */
export function suggestXQueryTerms(input: {
  examples: FeedbackExample[];
  includeKeywords: string[];
  excludeKeywords: string[];
  fallback: string[];
}): string[] {
  const excluded = new Set(input.excludeKeywords.map((value) => value.toLocaleLowerCase("ja-JP")));
  const score = new Map<string, number>();
  const add = (term: string, value: number) => {
    const key = term.toLocaleLowerCase("ja-JP");
    if (term.length < 2 || excluded.has(key)) return;
    score.set(term, (score.get(term) ?? 0) + value);
  };

  for (const term of input.includeKeywords) add(term, 12);
  const profile = buildLearningProfile(input.examples);
  for (const signal of profile.signals) {
    const lift = signal.probability - profile.globalProbability;
    if (lift > 0) add(signal.key, Math.max(0.25, lift * 20));
  }

  const learned = [...score.entries()]
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja-JP"))
    .map(([term]) => term);
  const fallback = input.fallback.filter((term) => !excluded.has(term.toLocaleLowerCase("ja-JP")));
  return [...new Set([...learned, ...fallback])].slice(0, 6);
}
