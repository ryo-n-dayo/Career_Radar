-- EventGathering: X APIの差分取得と、ローカル利用量上限の記録
ALTER TABLE "WatchSource" ADD COLUMN "lastExternalId" TEXT;

CREATE TABLE "XUsageDaily" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateKey" TEXT NOT NULL,
    "postsRead" INTEGER NOT NULL DEFAULT 0,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostUsd" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "XUsageDaily_dateKey_key" ON "XUsageDaily"("dateKey");
CREATE INDEX "XUsageDaily_dateKey_idx" ON "XUsageDaily"("dateKey");
