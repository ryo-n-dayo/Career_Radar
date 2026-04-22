-- AlterTable
ALTER TABLE "Company" ADD COLUMN "careersUrl" TEXT;
ALTER TABLE "Company" ADD COLUMN "lastFetchedAt" DATETIME;
ALTER TABLE "Company" ADD COLUMN "lastFetchedHash" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Email" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gmailId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "snippet" TEXT,
    "timestamp" DATETIME NOT NULL,
    "labels" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Email_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Email" ("body", "createdAt", "from", "gmailId", "id", "isRead", "isStarred", "labels", "snippet", "subject", "timestamp", "to", "updatedAt", "userId") SELECT "body", "createdAt", "from", "gmailId", "id", "isRead", "isStarred", "labels", "snippet", "subject", "timestamp", "to", "updatedAt", "userId" FROM "Email";
DROP TABLE "Email";
ALTER TABLE "new_Email" RENAME TO "Email";
CREATE UNIQUE INDEX "Email_gmailId_key" ON "Email"("gmailId");
CREATE INDEX "Email_userId_timestamp_idx" ON "Email"("userId", "timestamp");
CREATE INDEX "Email_gmailId_idx" ON "Email"("gmailId");
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT,
    "title" TEXT,
    "content" TEXT,
    "postedAt" DATETIME,
    "externalId" TEXT,
    "author" TEXT,
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Post_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("author", "companyId", "content", "createdAt", "externalId", "id", "postedAt", "source", "title", "updatedAt", "url", "userId") SELECT "author", "companyId", "content", "createdAt", "externalId", "id", "postedAt", "source", "title", "updatedAt", "url", "userId" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE INDEX "Post_companyId_postedAt_idx" ON "Post"("companyId", "postedAt");
CREATE INDEX "Post_source_idx" ON "Post"("source");
CREATE INDEX "Post_userId_isNew_createdAt_idx" ON "Post"("userId", "isNew", "createdAt");
CREATE UNIQUE INDEX "Post_source_externalId_key" ON "Post"("source", "externalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
