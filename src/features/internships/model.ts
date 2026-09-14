export type InternshipRegion = "japan" | "malaysia" | "overseas" | "online";

export const INTERNSHIP_REGION_LABELS: Record<InternshipRegion, string> = {
  japan: "日本国内", malaysia: "マレーシア", overseas: "海外", online: "オンライン"
};

/** "一部リモート可" is intentionally excluded: this filter means full remote only. */
export function isFullRemoteEligible(title: string, summary?: string | null, sourceName?: string | null): boolean {
  const text = `${title} ${summary ?? ""} ${sourceName ?? ""}`.normalize("NFKC");
  return /フルリモート|完全リモート|fully\s+remote|full\s+remote/i.test(text);
}

/** Classifies only explicit location or remote-work text supplied by the official page. */
export function internshipRegion(title: string, summary?: string | null, sourceName?: string | null): InternshipRegion {
  const text = `${title} ${summary ?? ""} ${sourceName ?? ""}`.normalize("NFKC");
  if (/フルリモート|リモート(?:可|勤務|ワーク)?|remote(?:\s*work)?|オンライン(?:勤務|面談|選考)?/i.test(text)) return "online";
  if (/マレーシア|Malaysia|Kuala Lumpur|クアラルンプール|Penang|ペナン/i.test(text)) return "malaysia";
  if (/日本|Japan|東京|Tokyo|大阪|Osaka|京都|Kyoto|福岡|Fukuoka|名古屋|Nagoya|札幌|Sapporo|横浜|Yokohama|神戸|Kobe|渋谷|Shibuya|新宿|Shinjuku/i.test(text)) return "japan";
  // Existing Japanese official pages often omit a city; keep those domestic rather than mislabelling as overseas.
  if (/[ぁ-んァ-ヶ一-龠]/.test(text)) return "japan";
  return "overseas";
}
