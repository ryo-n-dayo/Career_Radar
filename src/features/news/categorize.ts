import type { NewsCategory, RawArticle } from "./types";

// キーワードベースでカテゴリを判定（Claude API 不要の軽量版）
const CATEGORY_RULES: Array<{ category: NewsCategory; keywords: string[] }> = [
  {
    category: "INTERNSHIP",
    keywords: ["インターン", "インターンシップ", "長期インターン", "短期インターン", "intern"],
  },
  {
    category: "CAREER_TIP",
    keywords: [
      "就活", "就職活動", "就職", "新卒", "採用", "選考", "面接", "ES", "エントリーシート",
      "OB訪問", "自己PR", "志望動機", "SPI", "グループディスカッション", "GD",
    ],
  },
  {
    category: "COLUMN",
    keywords: [
      "コツ", "方法", "ポイント", "ガイド", "まとめ", "体験談", "経験", "失敗", "成功",
      "アドバイス", "テクニック", "tips", "how to",
    ],
  },
];

export function classifyArticle(article: RawArticle): NewsCategory {
  const text = `${article.title} ${article.description}`.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return rule.category;
    }
  }
  return "COLUMN"; // fallback
}

// Claude API を使ってより精度の高い要約+分類を行う (ANTHROPIC_API_KEY がある場合のみ)
export async function summarizeAndClassify(
  article: RawArticle
): Promise<{ summary: string; category: NewsCategory }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const category = classifyArticle(article);

  if (!apiKey) {
    const fallback = article.description.trim() || article.title;
    return { summary: fallback.slice(0, 150), category };
  }

  try {
    const prompt = `以下の記事タイトルと概要を読んで、就活生向けに2文以内・最大100文字で日本語要約してください。余計な前置き不要。

タイトル: ${article.title}
概要: ${article.description.slice(0, 400)}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 150,
        system: [
          {
            type: "text",
            text: "あなたは就活生向けの情報整理アシスタントです。記事を簡潔に要約してください。",
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };
      const text = data.content?.find((c) => c.type === "text")?.text?.trim();
      if (text) return { summary: text.slice(0, 200), category };
    }
  } catch {
    // fall through to description-based fallback
  }

  return {
    summary: (article.description.trim() || article.title).slice(0, 150),
    category,
  };
}
