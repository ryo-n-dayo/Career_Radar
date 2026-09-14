export type XAuthor = {
  id: string;
  name?: string;
  username?: string;
  description?: string;
  url?: string;
  verified?: boolean;
  public_metrics?: { followers_count?: number };
};

export type OrganizationDecision = {
  eligible: boolean;
  score: number;
  reasons: string[];
};

const ORGANIZATION_PROFILE = /公式|採用|人事|広報|株式会社|合同会社|有限会社|inc\.?|corp\.?|company|official|recruit|career|採用情報|新卒採用|中途採用|インターン|事業会社|スタートアップ|運営|チーム/i;
const ORGANIZATION_HANDLE = /official|recruit|career|jobs|hr|pr|company|corp|inc/i;
const PERSONAL_PROFILE = /個人|フリーランス|大学生|学生|日常|趣味|推し活|子育て|投資家/i;
const EVENT_ORGANIZER_PROFILE = /スタートアップ|起業|vc|投資|キャリア|採用|人材|学生|コミュニティ|イベント|アクセラレータ|インキュベーション|大学|メディア|広報|企画|community|developer|conference|foundation|open\s*source/i;

const BUSINESS_POST = /採用|募集|求人|エントリー|選考|インターン|説明会|会社説明|新卒|中途|リリース|提供開始|新サービス|新製品|資金調達|業務提携|新規事業|プレスリリース|イベント|セミナー|ミートアップ|展示会|登壇|開催|参加者募集|学生向け|大学生|キャリアイベント|就活イベント|合同説明会|共催|主催|申込(?:み)?|event|meetup|workshop|conference|summit|hackathon|register|registration|join us/i;
const EVENT_ANNOUNCEMENT = /イベント|セミナー|ミートアップ|展示会|登壇|開催|参加者募集|学生向け|大学生|キャリアイベント|就活イベント|合同説明会|共催|主催|申込(?:み)?|event|meetup|workshop|conference|summit|hackathon|register|registration|join us/i;
const REACTION_POST = /感想|行ってきた|参加してきた|参加しました|楽しかった|面白かった|最高|推し|私も|今日の[感想記録]|〜してみた|i attended|had a great time|my thoughts/i;

/**
 * Xが公開する投稿者情報だけを使い、企業・団体の一次発信らしさを判定する。
 * 認証バッジやフォロワー数だけでは判定せず、プロフィール上の組織性・公式URLを重視する。
 */
export function assessOrganizationAuthor(author?: XAuthor): OrganizationDecision {
  if (!author) return { eligible: false, score: 0, reasons: ["投稿者情報を取得できません"] };

  const profile = `${author.name ?? ""} ${author.username ?? ""} ${author.description ?? ""}`;
  const followers = author.public_metrics?.followers_count ?? 0;
  const hasOrganizationProfile = ORGANIZATION_PROFILE.test(profile);
  const hasOrganizationHandle = ORGANIZATION_HANDLE.test(author.username ?? "");
  const hasWebsite = Boolean(author.url);
  const looksPersonal = PERSONAL_PROFILE.test(profile);
  const reasons: string[] = [];
  let score = 0;

  if (hasOrganizationProfile) {
    score += 12;
    reasons.push("企業・団体プロフィール");
  }
  if (hasOrganizationHandle) {
    score += 5;
    reasons.push("公式用途のアカウント名");
  }
  if (hasWebsite) {
    score += 8;
    reasons.push("公式サイトURLあり");
  }
  if (author.verified) {
    score += 4;
    reasons.push("認証済み");
  }
  if (followers >= 500) score += 2;
  if (looksPersonal && !hasOrganizationProfile) score -= 10;

  const eligible =
    hasOrganizationProfile ||
    (hasWebsite && (author.verified || followers >= 500)) ||
    (hasWebsite && hasOrganizationHandle);

  return { eligible, score: Math.max(0, score), reasons };
}

/**
 * 個人名の発信者でも、イベントの主催・共催・告知を行う専門家なら一次情報として扱う。
 * 単なる認証バッジでは通さず、専門性を示すプロフィールと強いイベント告知の両方を求める。
 */
export function assessEventOrganizer(author?: XAuthor): OrganizationDecision {
  if (!author) return { eligible: false, score: 0, reasons: ["投稿者情報を取得できません"] };
  const profile = `${author.name ?? ""} ${author.username ?? ""} ${author.description ?? ""}`;
  const hasProfessionalProfile = EVENT_ORGANIZER_PROFILE.test(profile);
  const hasTrustSignal = Boolean(author.verified || author.url || (author.public_metrics?.followers_count ?? 0) >= 2_000);
  const eligible = hasProfessionalProfile && hasTrustSignal;
  const reasons: string[] = [];
  if (hasProfessionalProfile) reasons.push("イベント主催・告知の専門プロフィール");
  if (author.verified) reasons.push("認証済み");
  else if (author.url) reasons.push("公式サイトURLあり");
  else if ((author.public_metrics?.followers_count ?? 0) >= 2_000) reasons.push("一定の公開フォロワー数");
  return { eligible, score: eligible ? 16 : 0, reasons };
}

/** 企業・団体の告知として役立つ可能性がある一次情報だけを残す。 */
export function assessCorporatePost(text: string, author?: XAuthor): OrganizationDecision {
  const account = assessOrganizationAuthor(author);
  const eventOrganizer = assessEventOrganizer(author);
  const hasBusinessSignal = BUSINESS_POST.test(text);
  const isEventAnnouncement = EVENT_ANNOUNCEMENT.test(text);
  const looksLikeReaction = REACTION_POST.test(text);

  const useEventOrganizer = eventOrganizer.eligible && isEventAnnouncement;
  const source = useEventOrganizer ? eventOrganizer : account;
  if (!source.eligible) return source;
  if (!hasBusinessSignal) {
    return { eligible: false, score: source.score, reasons: [...source.reasons, "告知・事業情報の語句なし"] };
  }
  if (looksLikeReaction && !/採用|募集|求人|インターン|リリース|資金調達|プレスリリース|参加者募集/i.test(text)) {
    return { eligible: false, score: source.score, reasons: [...source.reasons, "感想・体験談らしい投稿"] };
  }

  const origin = useEventOrganizer ? "イベント主催者・告知者の一次発信" : "企業・団体の公式発信";
  return { eligible: true, score: Math.min(30, source.score + 8), reasons: [origin, ...source.reasons] };
}
