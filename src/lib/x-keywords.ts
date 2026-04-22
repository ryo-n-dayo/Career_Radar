export const X_KEYWORDS = ['28卒', 'エンジニア', 'サマーインターン'] as const;

export type XKeyword = (typeof X_KEYWORDS)[number];

export function matchKeywords(text: string): XKeyword[] {
  const normalized = text.toLowerCase();
  return X_KEYWORDS.filter((kw) => normalized.includes(kw.toLowerCase()));
}
