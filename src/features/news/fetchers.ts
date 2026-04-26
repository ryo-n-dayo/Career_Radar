import type { RawArticle } from "./types";

const UA = { "User-Agent": "Career-Radar/1.0" };
const TIMEOUT = 10_000;

function decodeEntities(str: string): string {
  if (!str) return str;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

function stripHtml(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, ""));
}

function parseDate(s: string | undefined): Date {
  if (!s) return new Date();
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

type RssItem = { title: string; link: string; description: string; pubDate: string };

function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const tagRe = (tag: string) =>
    new RegExp(
      `<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))<\\/${tag}>`,
      "i"
    );
  const itemRe = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const pick = (tag: string) => {
      const x = block.match(tagRe(tag));
      return (x?.[1] ?? x?.[2] ?? "").trim();
    };
    items.push({
      title: pick("title"),
      link: pick("link"),
      description: pick("description"),
      pubDate: pick("pubDate"),
    });
  }
  return items;
}

/** Run per-source requests in parallel, swallow individual failures, dedupe by URL. */
async function collect<T>(
  tasks: Array<() => Promise<RawArticle[]>>
): Promise<RawArticle[]> {
  const settled = await Promise.allSettled(tasks.map((t) => t()));
  const seen = new Set<string>();
  const out: RawArticle[] = [];
  for (const r of settled) {
    if (r.status !== "fulfilled") continue;
    for (const a of r.value) {
      if (!a.url || seen.has(a.url)) continue;
      seen.add(a.url);
      out.push(a);
    }
  }
  return out;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(TIMEOUT) });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

async function fetchJson<T>(url: string, headers: HeadersInit = {}): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { ...UA, ...headers },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

// ─── Hatena (人気エントリー RSS) ─────────────────────────────
const HATENA_FEEDS = [
  "https://b.hatena.ne.jp/search/text?q=%E5%B0%B1%E6%B4%BB&mode=rss&sort=recent",
  "https://b.hatena.ne.jp/search/text?q=%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%B3&mode=rss&sort=recent",
  "https://b.hatena.ne.jp/search/text?q=ES+%E6%9B%B8%E3%81%8D%E6%96%B9&mode=rss&sort=recent",
];

export function fetchHatena(): Promise<RawArticle[]> {
  return collect(
    HATENA_FEEDS.map((url) => async () => {
      const xml = await fetchText(url);
      if (!xml) return [];
      return parseRss(xml)
        .slice(0, 10)
        .filter((i) => i.link)
        .map((i) => ({
          title: decodeEntities(i.title),
          description: stripHtml(i.description).slice(0, 300),
          url: i.link,
          source: "hatena" as const,
          publishedAt: parseDate(i.pubDate),
        }));
    })
  );
}

// ─── Zenn (トピック RSS) ────────────────────────────────────
const ZENN_FEEDS = [
  "https://zenn.dev/topics/career/feed",
  "https://zenn.dev/topics/転職/feed",
];

export function fetchZenn(): Promise<RawArticle[]> {
  return collect(
    ZENN_FEEDS.map((url) => async () => {
      const xml = await fetchText(url);
      if (!xml) return [];
      return parseRss(xml)
        .slice(0, 8)
        .filter((i) => i.link)
        .map((i) => ({
          title: decodeEntities(i.title),
          description: stripHtml(i.description).slice(0, 300),
          url: i.link,
          source: "zenn" as const,
          publishedAt: parseDate(i.pubDate),
        }));
    })
  );
}

// ─── GNews (JSON API, キー必須) ─────────────────────────────
type GNewsResp = {
  articles?: Array<{
    title: string;
    description: string | null;
    url: string;
    publishedAt: string;
    image?: string | null;
  }>;
};

const GNEWS_QUERIES = [
  { q: "就活 新卒採用", max: 5 },
  { q: "インターンシップ 募集", max: 5 },
  { q: "ES 面接 就活 コツ", max: 5 },
];

export function fetchGNews(apiKey: string): Promise<RawArticle[]> {
  return collect(
    GNEWS_QUERIES.map(({ q, max }) => async () => {
      const params = new URLSearchParams({
        q,
        lang: "ja",
        country: "jp",
        max: String(max),
        apikey: apiKey,
        sortby: "publishedAt",
      });
      const data = await fetchJson<GNewsResp>(`https://gnews.io/api/v4/search?${params}`);
      return (data?.articles ?? [])
        .filter((a) => a.url)
        .map((a) => ({
          title: a.title,
          description: (a.description ?? "").slice(0, 300),
          url: a.url,
          source: "gnews" as const,
          publishedAt: new Date(a.publishedAt),
          imageUrl: a.image ?? undefined,
        }));
    })
  );
}

// ─── Qiita (JSON API, 無認証 60 req/h) ───────────────────────
type QiitaItem = { title: string; url: string; body: string; created_at: string };

const QIITA_QUERIES = [
  "tag:就活 OR tag:新卒採用",
  "tag:インターン tag:エンジニア",
  "tag:キャリア tag:転職",
];

export function fetchQiita(): Promise<RawArticle[]> {
  return collect(
    QIITA_QUERIES.map((query) => async () => {
      const params = new URLSearchParams({ query, per_page: "8", sort: "created" });
      const items = await fetchJson<QiitaItem[]>(`https://qiita.com/api/v2/items?${params}`);
      return (items ?? []).map((i) => ({
        title: i.title,
        // body is markdown; strip syntax chars for description preview.
        description: i.body.replace(/[#*`>\-\[\]!]/g, "").trim().slice(0, 200),
        url: i.url,
        source: "qiita" as const,
        publishedAt: new Date(i.created_at),
      }));
    })
  );
}
