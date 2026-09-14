export type CompanyItem = {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  summary?: string;
  memo?: string;
  xHandle?: string;
  careersUrl?: string;
  tags: string[];
  postCount: number;
  eventCount: number;
  sourceCount: number;
};
