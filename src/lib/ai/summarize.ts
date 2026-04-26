const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

export type SummarizeOptions = {
  apiKey?: string;
  model?: string;
  maxRetries?: number;
};

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(
  input: string,
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
          await sleep(backoff);
          attempt += 1;
          backoff = Math.min(5000, Math.round(backoff * 1.8));
          continue;
        }
      }
      return res;
    } catch {
      if (attempt >= maxRetries) throw new Error('OpenAI APIへの接続に失敗しました。');
      await sleep(backoff);
      attempt += 1;
      backoff = Math.min(5000, Math.round(backoff * 1.8));
    }
  }
}

export async function summarizeTweet(
  text: string,
  opts: SummarizeOptions = {}
): Promise<string | null> {
  const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `
あなたは就活生向けの情報整理アシスタントです。以下のX(Twitter)投稿を、就活生にとって何が役立つ情報かが1〜2文で分かるように日本語で簡潔に要約してください。余計な前置き・末尾の定型句は不要。最大120文字。

投稿:
"""
${text.slice(0, 800)}
"""
`.trim();

  const res = await fetchWithRetry(
    OPENAI_URL,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: opts.model ?? DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })
    },
    opts.maxRetries ?? 3
  );

  if (!res.ok) return null;

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const summary = data?.choices?.[0]?.message?.content;

  return summary?.trim().slice(0, 200) ?? null;
}
