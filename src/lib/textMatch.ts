/** Latin words must not match inside another word (AI/detail, UI/build, OSS/across). */
export function containsInterestTerm(text: string, term: string): boolean {
  const normalized = term.normalize("NFKC").trim().toLocaleLowerCase("ja-JP");
  if (!normalized) return false;
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = /^[a-z0-9]/.test(normalized) ? "(?<![a-z0-9])" : "";
  const end = /[a-z0-9]$/.test(normalized) ? "(?![a-z0-9])" : "";
  return new RegExp(`${start}${escaped}${end}`, "u").test(text.normalize("NFKC").toLocaleLowerCase("ja-JP"));
}
