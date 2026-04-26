import type { SourceInfo } from "@/types/source";

export type DeadlineLabel = "締切" | "早期選考" | "説明会";

export type RadarCategory = "インターン" | "説明会" | "選考";

export type Trust = "official" | "needs_review";

export type JointParticipant = {
  companyName: string;
  role: "主催" | "協賛" | "参加";
  companyProfile?: CompanyProfile;
};

export type RadarItem = {
  id: string;
  companyName: string; // 単一企業名 or 合同時は主催企業名
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
  isJoint?: boolean;
  participants?: JointParticipant[];
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
  ceo?: string;
  listed?: string;
  ticker?: string;
  capital?: string;
  mission?: string;
  businessSegments?: string[];
  idealCandidate?: string;
  cultureDescription?: string;
  cultureTags?: string[];
};

