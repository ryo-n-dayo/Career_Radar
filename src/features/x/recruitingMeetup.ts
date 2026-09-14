const EVENT_FORMAT = /イベント|セミナー|meet\s*up|meetup|ミートアップ|交流会|座談会|説明会|ハッカソン|hackathon|ワークショップ|workshop|design\s*sprint|デザインスプリント|アイデアソン|技術体験|デモ体験|tech\s*talk|勉強会|開発体験|ハンズオン|hands[- ]?on|conference|カンファレンス|フェスティバル|festival|summit|forum|フォーラム|contest|コンテスト|session|セッション/i;
const TECH_SIGNAL = /エンジニア|開発|プログラミング|ソフトウェア|ai|llm|データ|クラウド|\bcloud\b|セキュリティ|デザイン|プロダクト|dev|コード|技術|aws|azure|gcp|google\s*cloud|kubernetes|open\s*source|オープンソース|pytorch|machine\s*learning/i;
const EVENT_INVITATION = /開催(?:します|いたします|予定)?|参加者?募集|申込(?:み)?|お申し込み|受付(?:中)?|予約|来場(?:者)?募集|参加(?:でき|いただけ|可能)|register|登録(?:はこちら)?/i;
const EVENT_DIRECTORY = /^(?:クラウドイベント|イベント\s*[|、と]|イベントとウェビナー|Microsoft Reactor)|^イベントの(?:詳細|コンテンツ|利用規約|行動規範)$|^近日開催(?:予定)?の.*イベントを見る$|^トレーニングと認定のイベントを詳しく見る$/i;

/**
 * スキルを伸ばせる技術イベントだけを切り出す。
 * 一般的な催事、告知だけの登壇、参加者の感想はこの専用面には出さない。
 */
export function isTechGrowthEvent(text: string): boolean {
  return EVENT_FORMAT.test(text) && TECH_SIGNAL.test(text) && EVENT_INVITATION.test(text);
}

/**
 * 公式イベントページ向けの判定。Xでは別途、参加告知まで必須にする。
 * 公式個別ページには申込導線を本文で描画するものもあるため、メタ説明だけで
 * 参加語が取れない場合でも、技術領域と具体的な開催形式があれば残す。
 */
export function isTechEventRecord(input: { title: string; summary?: string | null }): boolean {
  const text = `${input.title} ${input.summary ?? ""}`;
  const hasConcreteFormat = /ハッカソン|hackathon|ワークショップ|workshop|design\s*sprint|デザインスプリント|アイデアソン|ハンズオン|hands[- ]?on|meet\s*up|meetup|ミートアップ|勉強会|conference|カンファレンス|tech\s*talk|フェスティバル|リレーイベント|summit|forum|フォーラム|contest|コンテスト|session|セッション/i.test(text);
  return !EVENT_DIRECTORY.test(input.title.trim()) && hasConcreteFormat && TECH_SIGNAL.test(text);
}

/**
 * 日本国内を基本に、海外はマレーシア開催かオンライン開催だけを表示する。
 * Xの日本語投稿は、明示的な海外会場がなければ国内告知として残す。英語の海外
 * イベントを推測で通さないため、公式Webページは開催地・オンライン表記を必須にする。
 */
export function isAllowedTechEventLocation(input: {
  title: string;
  summary?: string | null;
  sourceName?: string | null;
  sourceNotes?: string | null;
  sourceKind?: string | null;
}): boolean {
  const text = `${input.title} ${input.summary ?? ""} ${input.sourceName ?? ""} ${input.sourceNotes ?? ""}`;
  const inJapan = /日本|Japan|東京|Tokyo|大阪|Osaka|京都|Kyoto|福岡|Fukuoka|名古屋|Nagoya|札幌|Sapporo|横浜|Yokohama|神戸|Kobe/i.test(text);
  const inMalaysia = /マレーシア|Malaysia|Kuala Lumpur|クアラルンプール/i.test(text);
  const online = /オンライン|online|virtual|livestream|live\s*stream|配信|YouTube\s*Live/i.test(text);
  if (inJapan || inMalaysia || online) return true;

  const explicitForeignVenue = /Las Vegas|Salt Lake City|Shanghai|Seoul|Berlin|Prague|Barcelona|San Francisco|Mountain View|United States|China|Korea|Singapore|London|New York/i.test(text);
  return input.sourceKind === "X_ALGO_TECH_EVENT" && /[ぁ-んァ-ヶ一-龠]/.test(text) && !explicitForeignVenue;
}

export function techEventDetails(text: string): { schedule?: string; place?: string } {
  const schedule = text.match(/(?:20\d{2}[/.年]\s*)?\d{1,2}[/.月]\d{1,2}日?(?:\s*[（(]?[月火水木金土日][）)]?)?(?:\s*\d{1,2}(?::\d{2})?\s*[〜～\-]\s*\d{1,2}(?::\d{2})?)?|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:\s*[–-]\s*\d{1,2})?(?:,?\s*20\d{2})?/i)?.[0]?.trim();
  const place = text.match(/(?:東京|渋谷|新宿|品川|恵比寿|六本木|大手町|日本橋|目黒|大阪|京都|福岡|オンライン|弊社オフィス|Tokyo|Kuala Lumpur|クアラルンプール|Malaysia|マレーシア|Las Vegas|Salt Lake City|Shanghai|Seoul|Berlin|Prague|Barcelona|San Francisco|Mountain View|United States|China|Japan)[^\n。]{0,28}/i)?.[0]?.trim();
  return { schedule: schedule || undefined, place: place || undefined };
}
