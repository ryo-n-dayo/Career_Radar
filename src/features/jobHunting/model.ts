export type JobTrack = "newGraduate" | "earlyCareer";

export function jobTrack(title: string, summary?: string | null): JobTrack {
  return /第二新卒|既卒|就業経験|early\s*career/i.test(`${title} ${summary ?? ""}`) ? "earlyCareer" : "newGraduate";
}

export function graduationLabel(title: string, summary?: string | null): string {
  const text = `${title} ${summary ?? ""}`.normalize("NFKC");
  const year = text.match(/(20(?:2[7-9]|3\d))\s*年?卒/);
  if (year) return `${year[1]}卒対象`;
  if (/新卒|new\s*grad/i.test(text)) return "新卒対象";
  return "技術職採用";
}

export function jobFocus(title: string, summary?: string | null): string {
  const text = `${title} ${summary ?? ""}`;
  if (/ソリューションアーキテクト|クラウド|aws|gcp|azure/i.test(text)) return "Cloud / Architecture";
  if (/ai|llm|機械学習|人工知能|データサイエンス/i.test(text)) return "AI / Data";
  if (/セキュリティ|security/i.test(text)) return "Security";
  if (/組み込み|embedded|c\+\+/i.test(text)) return "Embedded / Systems";
  return "Software Engineering";
}
