export type PostItem = {
  id: string;
  url: string;
  author?: string;
  account?: string;
  content: string;
  summary?: string;
  memo?: string;
  tags: string[];
  postedAt?: string;
  savedAt: string;
  companyId?: string;
  companyName?: string;
};

export type CompanyOption = { id: string; name: string };
