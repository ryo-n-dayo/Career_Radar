export type ExtractedEventInfo = {
  deadline: string | null; // ISO date (YYYY-MM-DD) or null if not found
  category: "インターン" | "説明会" | "選考" | null;
  deadlineLabel: "締切" | "早期選考" | "説明会" | null;
  summary: string | null;
};

function stripHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 採用ページのHTMLから締切・カテゴリ・サマリをAIで抽出する。
 * ANTHROPIC_API_KEY未設定、またはAIが情報を見つけられない場合はnullフィールドを返す
 * （既存値を上書きしないようにcaller側でnullチェックすること）。
 */
export async function extractEventInfo(
  companyName: string,
  html: string
): Promise<ExtractedEventInfo | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const text = stripHtml(html).slice(0, 6000);
  const today = new Date().toISOString().slice(0, 10);

  const prompt = `以下は「${companyName}」の採用ページのテキストです。就活生向けの採用情報として、次のJSON形式で抽出してください。情報が見つからない項目はnullにしてください。今日の日付は${today}です。

JSON形式（これ以外のテキストは出力しないこと）:
{"deadline": "YYYY-MM-DD or null", "category": "インターン" | "説明会" | "選考" | null, "deadlineLabel": "締切" | "早期選考" | "説明会" | null, "summary": "1行要約（最大60文字） or null"}

ページテキスト:
"""
${text}
"""`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        system: "あなたは採用ページから構造化データを抽出するアシスタントです。指定されたJSON形式以外は絶対に出力しないでください。",
        messages: [{ role: "user", content: prompt }]
      }),
      signal: AbortSignal.timeout(20_000)
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const rawText = data.content?.find((c) => c.type === "text")?.text?.trim();
    if (!rawText) return null;

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as Partial<ExtractedEventInfo>;
    return {
      deadline: parsed.deadline ?? null,
      category: parsed.category ?? null,
      deadlineLabel: parsed.deadlineLabel ?? null,
      summary: parsed.summary ?? null
    };
  } catch {
    return null;
  }
}
