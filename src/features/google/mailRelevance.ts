type MailLike = { fromAddress?: string | null; subject: string; snippet?: string | null };

const INTERNSHIP_SIGNAL = /インターン(?:シップ)?|長期インターン|新卒採用|採用(?:情報|イベント|説明会)?|recruit(?:ing|ment)?|\bintern(?:ship)?\b|career\s*(?:event|fair|session)?|エントリー|応募(?:受付|開始|締切)?/i;
const EVENT_FORMAT = /イベント|セミナー|カンファレンス|ハッカソン|ワークショップ|ミートアップ|勉強会|説明会|技術体験|開発体験|meet\s*up|conference|hackathon|workshop|webinar|tech\s*talk|summit|contest/i;
const TECH_CONTEXT = /エンジニア|開発|プログラミング|ソフトウェア|AI|LLM|データ|クラウド|セキュリティ|プロダクト|デザイン|AWS|Azure|GCP|Google\s*Cloud|Kubernetes|OSS|open\s*source|developer|engineering|machine\s*learning|data\s*(?:science|engineering)|cloud/i;

/**
 * Gmailは「インターン関連」または「技術イベント関連」に限定する。
 * 単なる技術ニュース、一般の予定通知、広告メールは表示しない。
 */
export function isRelevantGoogleMail(mail: MailLike): boolean {
  const text = `${mail.fromAddress ?? ""} ${mail.subject} ${mail.snippet ?? ""}`;
  return INTERNSHIP_SIGNAL.test(text) || (EVENT_FORMAT.test(text) && TECH_CONTEXT.test(text));
}
