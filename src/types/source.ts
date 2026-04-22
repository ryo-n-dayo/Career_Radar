export const SOURCE_TYPES = [
  'X',
  'OFFICIAL_WEB',
] as const;

export type SourceType = typeof SOURCE_TYPES[number];

export interface SourceInfo {
  type: SourceType;
  url: string;        // 元記事・投稿のURL
  fetchedAt: Date;    // 取得日時
}
