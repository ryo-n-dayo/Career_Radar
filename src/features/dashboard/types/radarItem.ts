import type { SourceInfo } from "@/types/source";

export type DeadlineLabel = "締切" | "早期選考" | "説明会";

export type RadarCategory = "インターン" | "早期選考" | "セミナー" | "本選考" | "説明会";

export type Trust = "official" | "needs_review";

export type RadarItem = {
  id: string;
  companyName: string;
  category: RadarCategory;
  content: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  deadlineLabel: DeadlineLabel;
  aiHeat: number; // 0-100
  keywords: string[];
  sources: SourceInfo[];
  trust: Trust;
  saved?: boolean;
  xInsights?: {
    author: string;
    role: string;
    date: string;
    message: string;
  }[];
  companyProfile?: CompanyProfile;
};

export type CompanyProfile = {
  overview: string;
  industry: string;
  founded: string;
  headquarters: string;
  employees: string;
  revenue?: string;
  hiringCount: string;
  hiringRoles: string[];
  selectionFlow?: string[];
  website?: string;
};

