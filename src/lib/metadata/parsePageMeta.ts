/**
 * HTML 文字列からイベント登録フォームの前埋め材料を抜き出す。
 * ネットワークに触れない純関数なので、そのままテストできる。
 * 取得は fetchPageMeta.ts が担当する。
 */

export type PageMeta = {
  /** リダイレクト後の最終 URL */
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  /** JSON-LD の Event から取れた場合のみ入る */
  startsAt?: Date;
  endsAt?: Date;
  venue?: string;
};

/**
 * 告知本文をそのまま複製・再配信しないための上限。
 * 詳細は必ず元ページへのリンクで見せる。
 */
export const DESCRIPTION_MAX_LENGTH = 200;

function decodeEntities(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, "&"); // 二重デコードを避けるため最後に処理する
}

function normalize(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const cleaned = decodeEntities(value).replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

export function truncateDescription(value: string | undefined): string | undefined {
  const normalized = normalize(value);
  if (!normalized) return undefined;
  if (normalized.length <= DESCRIPTION_MAX_LENGTH) return normalized;
  return `${normalized.slice(0, DESCRIPTION_MAX_LENGTH)}…`;
}

/** <meta property="og:title" content="..."> を属性順に依らず拾う */
function findMetaContent(html: string, keys: string[]): string | undefined {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];

  for (const key of keys) {
    for (const tag of metaTags) {
      const nameMatch = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i);
      if (!nameMatch || nameMatch[1].toLowerCase() !== key.toLowerCase()) continue;
      const contentMatch = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
      const value = normalize(contentMatch?.[1]);
      if (value) return value;
    }
  }

  return undefined;
}

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

type JsonLdNode = Record<string, unknown>;

/** @graph やトップレベル配列を含めて全ノードを平らに集める */
function collectJsonLdNodes(html: string): JsonLdNode[] {
  const blocks = html.match(
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  if (!blocks) return [];

  const nodes: JsonLdNode[] = [];

  for (const block of blocks) {
    const jsonText = block.replace(/^<script\b[^>]*>/i, "").replace(/<\/script>$/i, "");
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      continue; // 壊れた JSON-LD は黙って飛ばす（OGP へフォールバックする）
    }

    const queue: unknown[] = [parsed];
    while (queue.length > 0) {
      const current = queue.shift();
      if (Array.isArray(current)) {
        queue.push(...current);
      } else if (current && typeof current === "object") {
        const node = current as JsonLdNode;
        nodes.push(node);
        if ("@graph" in node) queue.push(node["@graph"]);
      }
    }
  }

  return nodes;
}

function isEventNode(node: JsonLdNode): boolean {
  const type = node["@type"];
  const types = Array.isArray(type) ? type : [type];
  return types.some((t) => typeof t === "string" && /event$/i.test(t));
}

/** JSON-LD の location は文字列 / Place / PostalAddress と揺れるので個別に潰す */
function extractLocation(location: unknown): string | undefined {
  if (typeof location === "string") return normalize(location);
  if (Array.isArray(location)) {
    for (const entry of location) {
      const found = extractLocation(entry);
      if (found) return found;
    }
    return undefined;
  }
  if (!location || typeof location !== "object") return undefined;

  const node = location as JsonLdNode;
  const name = normalize(typeof node.name === "string" ? node.name : undefined);

  const address = node.address;
  let addressText: string | undefined;
  if (typeof address === "string") {
    addressText = normalize(address);
  } else if (address && typeof address === "object") {
    const addr = address as JsonLdNode;
    addressText = normalize(
      [addr.addressRegion, addr.addressLocality, addr.streetAddress]
        .filter((part): part is string => typeof part === "string")
        .join(" ")
    );
  }

  if (name && addressText) return `${name} (${addressText})`;
  return name ?? addressText;
}

export function parsePageMeta(html: string, finalUrl: string): PageMeta {
  const meta: PageMeta = { url: finalUrl };

  // 1) JSON-LD の Event を最優先
  const eventNode = collectJsonLdNodes(html).find(isEventNode);
  if (eventNode) {
    meta.title = normalize(typeof eventNode.name === "string" ? eventNode.name : undefined);
    meta.description = truncateDescription(
      typeof eventNode.description === "string" ? eventNode.description : undefined
    );
    meta.startsAt = parseDate(eventNode.startDate);
    meta.endsAt = parseDate(eventNode.endDate);
    meta.venue = extractLocation(eventNode.location);
    if (typeof eventNode.image === "string") meta.imageUrl = normalize(eventNode.image);
  }

  // 2) OGP で埋める
  meta.title ??= findMetaContent(html, ["og:title", "twitter:title"]);
  meta.description ??= truncateDescription(
    findMetaContent(html, ["og:description", "twitter:description", "description"])
  );
  meta.imageUrl ??= findMetaContent(html, ["og:image", "twitter:image"]);
  meta.siteName = findMetaContent(html, ["og:site_name"]);

  // 3) <title> へフォールバック
  if (!meta.title) {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    meta.title = normalize(titleMatch?.[1]);
  }

  return meta;
}
