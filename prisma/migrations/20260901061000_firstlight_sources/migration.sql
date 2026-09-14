-- AlterTable
ALTER TABLE "Company" ADD COLUMN "careersUrl" TEXT;
ALTER TABLE "Company" ADD COLUMN "xHandle" TEXT;

-- CreateTable
CREATE TABLE "WatchSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'PAGE',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "confirmedAt" DATETIME,
    "termsUrl" TEXT,
    "notes" TEXT,
    "companyId" TEXT,
    "etag" TEXT,
    "lastModified" TEXT,
    "contentHash" TEXT,
    "lastCheckedAt" DATETIME,
    "lastSuccessAt" DATETIME,
    "lastChangedAt" DATETIME,
    "lastStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WatchSource_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'UPDATE',
    "score" INTEGER NOT NULL DEFAULT 0,
    "reasons" JSONB NOT NULL DEFAULT [],
    "publishedAt" DATETIME,
    "deadline" DATETIME,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "contentHash" TEXT NOT NULL,
    CONSTRAINT "Candidate_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WatchSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "WatchSource_url_key" ON "WatchSource"("url");
CREATE INDEX "WatchSource_enabled_lastCheckedAt_idx" ON "WatchSource"("enabled", "lastCheckedAt");
CREATE INDEX "WatchSource_companyId_idx" ON "WatchSource"("companyId");
CREATE INDEX "Candidate_status_score_detectedAt_idx" ON "Candidate"("status", "score", "detectedAt");
CREATE INDEX "Candidate_sourceId_idx" ON "Candidate"("sourceId");
CREATE UNIQUE INDEX "Candidate_sourceId_url_contentHash_key" ON "Candidate"("sourceId", "url", "contentHash");
