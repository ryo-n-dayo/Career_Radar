import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { parsePageMeta, type PageMeta } from "./parsePageMeta";

const TIMEOUT_MS = 10_000;
const MAX_BYTES = 1_000_000;
const MAX_REDIRECTS = 5;

const USER_AGENT =
  "EventRadarBot/0.1 (+manual single-page fetch; triggered by a site administrator)";

export class FetchPageMetaError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "FetchPageMetaError";
  }
}

/**
 * SSRF 対策。内部ネットワークへの到達を防ぐ。
 * 管理者しか叩けないエンドポイントだが、任意 URL を取得する以上は必須。
 */
function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const normalized = address.toLowerCase();
    if (normalized === "::1" || normalized === "::") return true;
    // fc00::/7 (ユニークローカル) と fe80::/10 (リンクローカル)
    if (/^f[cd][0-9a-f]{2}:/.test(normalized)) return true;
    if (/^fe[89ab][0-9a-f]:/.test(normalized)) return true;
    // IPv4-mapped (::ffff:10.0.0.1 など) は v4 として再判定する
    const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return false;
  }

  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true; // 解釈できないものは弾く
  const [a, b] = parts;

  if (a === 0 || a === 127) return true; // this-network / loopback
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true; // link-local (クラウドのメタデータ endpoint)
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved

  return false;
}

async function assertPublicUrl(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new FetchPageMetaError("http/https 以外の URL は取得できません", 400);
  }

  const host = url.hostname;
  if (isIP(host)) {
    if (isPrivateAddress(host)) {
      throw new FetchPageMetaError("内部ネットワークの URL は取得できません", 400);
    }
    return;
  }

  let addresses: Array<{ address: string }>;
  try {
    addresses = await lookup(host, { all: true });
  } catch {
    throw new FetchPageMetaError(`ホスト名を解決できません: ${host}`, 400);
  }

  if (addresses.length === 0 || addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new FetchPageMetaError("内部ネットワークの URL は取得できません", 400);
  }
}

/** 1MB を超えたら読むのをやめる。HTML の <head> は先頭にあるので途中で切っても困らない。 */
async function readCapped(response: Response): Promise<string> {
  const body = response.body;
  if (!body) return "";

  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8");
  let received = 0;
  let text = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      text += decoder.decode(value, { stream: true });
      if (received >= MAX_BYTES) break;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }

  return text;
}

/**
 * URL を1回だけ取得して登録フォームの前埋め材料を返す。
 * リダイレクトは自前で追う（最終 URL を確定させ、各ホップで SSRF 判定をかけるため）。
 */
export async function fetchPageMeta(rawUrl: string): Promise<PageMeta> {
  let current: URL;
  try {
    current = new URL(rawUrl);
  } catch {
    throw new FetchPageMetaError("URL の形式が正しくありません", 400);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      await assertPublicUrl(current);

      let response: Response;
      try {
        response = await fetch(current, {
          redirect: "manual",
          signal: controller.signal,
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "text/html,application/xhtml+xml"
          }
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new FetchPageMetaError("取得がタイムアウトしました", 504);
        }
        throw new FetchPageMetaError("ページを取得できませんでした", 502);
      }

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          throw new FetchPageMetaError("リダイレクト先が不明です", 502);
        }
        current = new URL(location, current);
        continue;
      }

      if (!response.ok) {
        throw new FetchPageMetaError(`ページを取得できませんでした (${response.status})`, 502);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType && !/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
        throw new FetchPageMetaError(`HTML ではありません (${contentType})`, 415);
      }

      const html = await readCapped(response);
      return parsePageMeta(html, current.toString());
    }

    throw new FetchPageMetaError("リダイレクトが多すぎます", 502);
  } finally {
    clearTimeout(timer);
  }
}
