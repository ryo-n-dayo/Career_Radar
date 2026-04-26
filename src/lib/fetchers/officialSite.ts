import { createHash } from 'crypto';

export type SiteFetchResult =
  | { status: 'unchanged'; hash: string }
  | { status: 'changed'; hash: string; previousHash: string | null }
  | { status: 'error'; error: string };

const USER_AGENT = 'CareerRadarBot/1.0 (+https://example.com/bot)';
const FETCH_TIMEOUT_MS = 15_000;

async function isAllowedByRobots(url: string): Promise<boolean> {
  try {
    const { origin } = new URL(url);
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { 'user-agent': USER_AGENT },
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return true;
    const text = await res.text();
    const path = new URL(url).pathname;
    let inRelevantBlock = false;
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (/^user-agent:/i.test(trimmed)) {
        const agent = trimmed.split(':')[1].trim();
        inRelevantBlock = agent === '*' || agent.toLowerCase() === 'careerradarbot';
      } else if (inRelevantBlock && /^disallow:/i.test(trimmed)) {
        const disallowed = trimmed.split(':')[1].trim();
        if (disallowed && path.startsWith(disallowed)) return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}

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
  if (!(await isAllowedByRobots(url))) {
    return { status: 'error', error: 'robots.txt によりアクセスが許可されていません' };
  }

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
