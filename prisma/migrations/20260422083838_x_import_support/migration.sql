-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "source" TEXT NOT NULL,
    "url" TEXT,
    "title" TEXT,
    "content" TEXT,
    "postedAt" DATETIME,
    "externalId" TEXT,
    "author" TEXT,
    "aiSummary" TEXT,
    "matchedKeywords" JSONB,
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Post_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("author", "companyId", "content", "createdAt", "externalId", "id", "isNew", "postedAt", "source", "title", "updatedAt", "url", "userId") SELECT "author", "companyId", "content", "createdAt", "externalId", "id", "isNew", "postedAt", "source", "title", "updatedAt", "url", "userId" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE INDEX "Post_companyId_postedAt_idx" ON "Post"("companyId", "postedAt");
CREATE INDEX "Post_source_idx" ON "Post"("source");
CREATE INDEX "Post_userId_isNew_createdAt_idx" ON "Post"("userId", "isNew", "createdAt");
CREATE UNIQUE INDEX "Post_source_externalId_key" ON "Post"("source", "externalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
