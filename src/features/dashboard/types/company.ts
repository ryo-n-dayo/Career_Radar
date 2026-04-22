export type CompanySource = "x" | "instagram" | "linkedin" | "website";

export type Company = {
  id: string;
  name: string;
  industry?: string;
  label?: "志望" | "選考中" | "情報収集中";
  confidence: number; // 0-100
  updatedAt: string; // ISO
  sources: CompanySource[];
  summary?: string;
};

