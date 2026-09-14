export type SourceItem = {
  id: string;
  name: string;
  url: string;
  kind: string;
  lastStatus: string;
  lastError?: string;
  lastCheckedAt?: string;
  companyName?: string;
};

export type CandidateItem = {
  id: string;
  url: string;
  title: string;
  summary?: string;
  content?: string;
  kind: string;
  score: number;
  reasons: string[];
  deadline?: string;
  detectedAt: string;
  status: string;
  sourceName: string;
  sourceKind?: string;
};

export type SourceCompany = { id: string; name: string };

export type XApiBudgetStatus = {
  enabled: boolean;
  configured: boolean;
  dailyPostLimit: number;
  monthlyBudgetUsd: number;
  postsReadToday: number;
  estimatedCostTodayUsd: number;
  postsReadMonth: number;
  estimatedCostMonthUsd: number;
  postReadCostUsd: number;
};

export type InterestProfileItem = {
  includeKeywords: string[];
  excludeKeywords: string[];
  selectedTopics: string[];
  topicHistory: Array<{ topicIds: string[]; selectedAt: string }>;
};

export type FeedbackStats = {
  ratedCount: number;
  averageValue: number;
};
