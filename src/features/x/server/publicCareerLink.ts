type XUrlEntities = { urls?: Array<{ expanded_url?: string; unwound_url?: string }> };

// 企業が公式投稿に直接載せた公開求人だけを、候補の遷移先として優先する。
// 求人まとめサイトや短縮URLの推測はしない。X API が展開した URL のみを扱う。
const DIRECT_ATS_HOSTS = [
  "herp.careers",
  "herp.cloud",
  "jobs.lever.co",
  "job-boards.greenhouse.io",
  "boards.greenhouse.io"
];

export function directCareerUrl(entities: XUrlEntities | undefined): string | undefined {
  for (const url of entities?.urls ?? []) {
    const raw = url.unwound_url ?? url.expanded_url;
    if (!raw) continue;
    try {
      const parsed = new URL(raw);
      const isKnownAts = DIRECT_ATS_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
      if (parsed.protocol === "https:" && isKnownAts) return parsed.toString();
    } catch {
      // X が展開した URL でも URL として解釈できないものは候補に使わない。
    }
  }
  return undefined;
}
