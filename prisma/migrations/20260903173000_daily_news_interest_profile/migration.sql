-- DailyNews: 個人用の収集条件（希望語・除外語）をPC内に保存する
CREATE TABLE "InterestProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "includeKeywords" JSONB NOT NULL DEFAULT [],
    "excludeKeywords" JSONB NOT NULL DEFAULT [],
    "updatedAt" DATETIME NOT NULL
);
