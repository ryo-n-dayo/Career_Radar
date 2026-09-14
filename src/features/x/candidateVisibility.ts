type CandidateForVisibility = {
  source: { kind: string };
  reasons: unknown;
};

/**
 * 企業一次情報フィルター導入前に保存された広いX_ALGO検索結果は、削除せずフィードだけから隠す。
 * 手動で選んだXアカウントや練習用データは対象外。
 */
export function isVisibleInPersonalFeed(candidate: CandidateForVisibility): boolean {
  if (!["X_ALGO", "X_ALGO_TECH_EVENT", "X_ALGO_LEARNING_BENEFIT"].includes(candidate.source.kind)) return true;
  return Array.isArray(candidate.reasons) && (
    candidate.reasons.includes("企業・団体の公式発信") ||
    candidate.reasons.includes("イベント主催者・告知者の一次発信")
  );
}
