export type NewsCategory = "CAREER_TIP" | "INTERNSHIP" | "COLUMN";
export type NewsSource = "hatena" | "gnews" | "qiita" | "zenn";

export type RawArticle = {
  title: string;
  description: string;
  url: string;
  source: NewsSource;
  publishedAt: Date;
  imageUrl?: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: NewsSource;
  category: NewsCategory;
  publishedAt: Date;
  fetchedAt: Date;
  isRead: boolean;
  imageUrl?: string | null;
};

export const CATEGORY_LABEL: Record<NewsCategory, string> = {
  CAREER_TIP: "就活Tips",
  INTERNSHIP: "インターン",
  COLUMN: "コラム",
};

export const SOURCE_LABEL: Record<NewsSource, string> = {
  hatena: "はてなB!",
  gnews: "GNews",
  qiita: "Qiita",
  zenn: "Zenn",
};
