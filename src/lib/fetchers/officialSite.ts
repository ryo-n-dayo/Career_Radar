import { createHash } from 'crypto';

export type SiteFetchResult =
  | { status: 'unchanged'; hash: string }
  | { status: 'changed'; hash: string; previousHash: string | null }
  | { status: 'error'; error: string };

const USER_AGENT = 'CareerRadarBot/1.0 (+https://example.com/bot)';
const FETCH_TIMEOUT_MS = 15_000;

function normalizeHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hashHtml(html: string): string {
  return createHash('sha256').update(normalizeHtml(html)).digest('hex');
}

export async function fetchSiteHash(
  url: string,
  previousHash: string | null
): Promise<SiteFetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml' },
      signal: controller.signal,
      redirect: 'follow'
    });

    if (!res.ok) {
      return { status: 'error', error: `HTTP ${res.status}` };
    }

    const html = await res.text();
    const hash = hashHtml(html);

    if (previousHash && previousHash === hash) {
      return { status: 'unchanged', hash };
    }
    return { status: 'changed', hash, previousHash };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { status: 'error', error: msg };
  } finally {
    clearTimeout(timer);
  }
}
