export type HeatmapTrend = "up" | "stable" | "down";

export type HeatmapResult = {
  score: number; // 0-100
  trend: HeatmapTrend;
  keywords: string[];
  reasoning: string;
};

export type HeatmapPost = {
  id?: string;
  source?: "X" | "OFFICIAL_WEB" | string;
  title?: string | null;
  content?: string | null;
  postedAt?: Date | string | null;
  url?: string | null;
};

export type SentimentLabel = "positive" | "neutral" | "negative";

export type SentimentProvider = (posts: HeatmapPost[]) => Promise<{
  labels: SentimentLabel[];
  reasoning?: string;
}>;

export type ComputeHeatmapOptions = {
  now?: Date;
  sentimentProvider?: SentimentProvider;
  /** OpenAI API key (fallback provider用) */
  openaiApiKey?: string;
  /** OpenAI model name */
  openaiModel?: string;
  /** Retry budget for OpenAI calls */
  maxRetries?: number;
};

const HIRING_KEYWORDS = [
  "採用",
  "募集",
  "エントリー",
  "選考",
  "早期選考",
  "説明会",
  "セミナー",
  "インターン",
  "本選考",
  "新卒",
  "中途",
  "カジュアル面談",
  "面談",
  "内定",
  "締切",
  "〆切",
  "締め切り",
  "応募",
  "職種",
  "エンジニア",
  "デザイナー",
  "PM",
  "マーケ",
  "オンライン説明会",
  "会社説明会"
] as const;

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function asDate(v: HeatmapPost["postedAt"]): Date | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeText(s: string) {
  return s
    .replace(/\s+/g, " ")
    .replace(/[“”"]/g, '"')
    .replace(/[’']/g, "'")
    .trim();
}

export function extractHiringKeywords(posts: HeatmapPost[]) {
  const counts = new Map<string, number>();
  for (const p of posts) {
    const text = normalizeText([p.title, p.content].filter(Boolean).join(" "));
    if (!text) continue;
    for (const kw of HIRING_KEYWORDS) {
      if (text.includes(kw)) {
        counts.set(kw, (counts.get(kw) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([kw]) => kw)
    .slice(0, 12);
}

function sentimentToUnit(label: SentimentLabel) {
  switch (label) {
    case "positive":
      return 1;
    case "neutral":
      return 0.5;
    case "negative":
      return 0;
  }
}

export function computePostingTrend(posts: HeatmapPost[], now: Date) {
  // compare last 7 days vs previous 7 days (within 30 days input)
  const last7Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prev7Start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  let last7 = 0;
  let prev7 = 0;

  for (const p of posts) {
    const d = asDate(p.postedAt);
    if (!d) continue;
    if (d >= last7Start && d <= now) last7 += 1;
    else if (d >= prev7Start && d < last7Start) prev7 += 1;
  }

  const changeRate = (last7 - prev7) / Math.max(prev7, 1); // -inf..inf
  // squash to 0..1 where 0.5 means flat
  const trendUnit = clamp01(0.5 + Math.max(-1, Math.min(1, changeRate)) / 2);

  let trend: HeatmapTrend = "stable";
  if (changeRate > 0.25) trend = "up";
  else if (changeRate < -0.25) trend = "down";

  return { last7, prev7, changeRate, trendUnit, trend };
}

function computeKeywordSignal(posts: HeatmapPost[], extracted: string[]) {
  if (posts.length === 0) return 0;
  if (extracted.length === 0) return 0;

  let matchedPosts = 0;
  for (const p of posts) {
    const text = normalizeText([p.title, p.content].filter(Boolean).join(" "));
    if (!text) continue;
    if (extracted.some((kw) => text.includes(kw))) matchedPosts += 1;
  }

  // percentage of posts that contain at least one hiring keyword
  return clamp01(matchedPosts / Math.max(1, posts.length));
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

function parseRetryAfterMs(retryAfter: string | null) {
  if (!retryAfter) return null;
  const seconds = Number(retryAfter);
  if (!Number.isNaN(seconds) && seconds >= 0) return seconds * 1000;
  const dateMs = Date.parse(retryAfter);
  if (!Number.isNaN(dateMs)) return Math.max(0, dateMs - Date.now());
  return null;
}

async function fetchWithRetry(
  input: RequestInfo,
  init: RequestInit,
  maxRetries: number
): Promise<Response> {
  let attempt = 0;
  let backoff = 400;
  for (;;) {
    try {
      const res = await fetch(input, init);
      if (!res.ok) {
        const retryable = res.status === 429 || (res.status >= 500 && res.status <= 599);
        if (retryable && attempt < maxRetries) {
          const retryAfter = parseRetryAfterMs(res.headers.get("retry-after"));
          await sleep(retryAfter ?? backoff);
          attempt += 1;
          backoff = Math.min(5000, Math.round(backoff * 1.8));
          continue;
        }
      }
      return res;
    } catch {
      if (attempt >= maxRetries) throw new Error("OpenAI APIへの接続に失敗しました。");
      await sleep(backoff);
      attempt += 1;
      backoff = Math.min(5000, Math.round(backoff * 1.8));
    }
  }
}

export function createOpenAISentimentProvider(opts: {
  apiKey: string;
  model?: string;
  maxRetries?: number;
}) {
  const model = opts.model ?? "gpt-4.1-mini";
  const maxRetries = opts.maxRetries ?? 4;

  return async (posts: HeatmapPost[]) => {
    const items = posts.slice(0, 40).map((p, idx) => ({
      i: idx,
      source: p.source ?? null,
      postedAt: asDate(p.postedAt)?.toISOString() ?? null,
      title: normalizeText(p.title ?? ""),
      content: normalizeText(p.content ?? "")
    }));

    // 1 request only (rate-limit friendly)
    const prompt = `
あなたは就活生向け企業情報アプリの分析AIです。
以下は「過去30日間の企業関連投稿」です。各投稿を採用の積極度に与える影響という観点で、センチメントを判定してください。

判定ラベル:
- positive: 採用・募集に前向き / 募集開始・締切前の告知・説明会開催など
- neutral: 情報共有だが採用積極度の判断材料が少ない
- negative: 募集停止・中止・延期・不採用が連想されるなど

制約:
- 出力は必ずJSONのみ
- labelsは入力順と同じ件数
- reasoningは日本語で短く（最大160文字）

入力投稿:
${JSON.stringify(items)}

出力形式:
{"labels":["positive"|"neutral"|"negative", ...], "reasoning":"..."}
`.trim();

    const res = await fetchWithRetry(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${opts.apiKey}`
        },
        body: JSON.stringify({
          model,
          input: prompt,
          temperature: 0.2
        })
      },
      maxRetries
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`OpenAI APIエラー: ${res.status} ${text}`.slice(0, 300));
    }

    const data = (await res.json()) as any;
    const outputText: string | undefined =
      data?.output?.[0]?.content?.find((c: any) => c?.type === "output_text")?.text ??
      data?.output_text;
    if (!outputText) throw new Error("OpenAI APIの応答が解析できませんでした。");

    let parsed: { labels: SentimentLabel[]; reasoning?: string };
    try {
      parsed = JSON.parse(outputText);
    } catch {
      throw new Error("OpenAI APIのJSON出力をパースできませんでした。");
    }

    const labels = Array.isArray(parsed.labels) ? parsed.labels : [];
    const normalized = labels.map((l) =>
      l === "positive" || l === "neutral" || l === "negative" ? l : "neutral"
    ) as SentimentLabel[];

    // if size mismatch, pad/trim
    const fixed =
      normalized.length === posts.length
        ? normalized
        : [...normalized.slice(0, posts.length), ...Array(Math.max(0, posts.length - normalized.length)).fill("neutral")];

    return { labels: fixed, reasoning: parsed.reasoning };
  };
}

export async function computeHiringHeatMap(
  posts: HeatmapPost[],
  options: ComputeHeatmapOptions = {}
): Promise<HeatmapResult> {
  const now = options.now ?? new Date();
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const within30 = posts.filter((p) => {
    const d = asDate(p.postedAt);
    if (!d) return true; // unknown date -> keep
    return d >= last30Start && d <= now;
  });

  const keywords = extractHiringKeywords(within30);
  const keywordUnit = computeKeywordSignal(within30, keywords); // 0..1

  const posting = computePostingTrend(within30, now);

  let sentimentUnit = 0.5;
  let reasoning = "直近30日投稿から採用関連キーワード・投稿頻度・センチメントを統合して算出しました。";

  const provider: SentimentProvider | undefined =
    options.sentimentProvider ??
    (options.openaiApiKey
      ? createOpenAISentimentProvider({
          apiKey: options.openaiApiKey,
          model: options.openaiModel,
          maxRetries: options.maxRetries
        })
      : process.env.OPENAI_API_KEY
        ? createOpenAISentimentProvider({
            apiKey: process.env.OPENAI_API_KEY,
            model: options.openaiModel,
            maxRetries: options.maxRetries
          })
        : undefined);

  if (provider && within30.length > 0) {
    try {
      const { labels, reasoning: r } = await provider(within30);
      const avg =
        labels.reduce((sum, l) => sum + sentimentToUnit(l), 0) / Math.max(1, labels.length);
      sentimentUnit = clamp01(avg);
      if (r && typeof r === "string" && r.trim()) reasoning = r.trim().slice(0, 160);
    } catch (e) {
      // fallback: neutral sentiment, keep deterministic output
      reasoning =
        e instanceof Error
          ? `AI分析に失敗したため一部を簡略化しました（${e.message}）。`
          : "AI分析に失敗したため一部を簡略化しました。";
    }
  } else {
    if (!provider) {
      reasoning =
        "OpenAI APIキーが未設定のため、センチメント分析を省略し、キーワードと投稿頻度で暫定スコアを算出しました。";
    }
  }

  // Weighted score composition
  // - keyword signal: 45%
  // - posting trend: 35%
  // - sentiment: 20%
  const unit =
    0.45 * keywordUnit + 0.35 * posting.trendUnit + 0.2 * sentimentUnit;

  // Boost if we have strong keyword signal and rising frequency
  const boost =
    keywordUnit >= 0.6 && posting.changeRate > 0.25 ? 0.08 : 0;

  const score = clampScore(100 * clamp01(unit + boost));

  const trend: HeatmapTrend =
    posting.trend !== "stable"
      ? posting.trend
      : sentimentUnit >= 0.7
        ? "up"
        : sentimentUnit <= 0.3
          ? "down"
          : "stable";

  return { score, trend, keywords, reasoning };
}

