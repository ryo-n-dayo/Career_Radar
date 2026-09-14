-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,
    "summary" TEXT,
    "memo" TEXT,
    "tags" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SavedPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "author" TEXT,
    "account" TEXT,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "memo" TEXT,
    "tags" JSONB NOT NULL DEFAULT [],
    "postedAt" DATETIME,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyId" TEXT,
    CONSTRAINT "SavedPost_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "externalId" TEXT,
    "ingestSource" TEXT NOT NULL DEFAULT 'MANUAL',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "kind" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "prefecture" TEXT,
    "venue" TEXT,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME,
    "applyDeadline" DATETIME,
    "organizer" TEXT,
    "organizerUrl" TEXT,
    "prize" TEXT,
    "tags" JSONB NOT NULL DEFAULT [],
    "capacity" INTEGER,
    "accepted" INTEGER,
    "companyId" TEXT,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");
CREATE UNIQUE INDEX "SavedPost_url_key" ON "SavedPost"("url");
CREATE INDEX "SavedPost_savedAt_idx" ON "SavedPost"("savedAt");
CREATE INDEX "SavedPost_companyId_idx" ON "SavedPost"("companyId");
CREATE UNIQUE INDEX "Event_url_key" ON "Event"("url");
CREATE INDEX "Event_startsAt_idx" ON "Event"("startsAt");
CREATE INDEX "Event_applyDeadline_idx" ON "Event"("applyDeadline");
CREATE INDEX "Event_kind_startsAt_idx" ON "Event"("kind", "startsAt");
CREATE INDEX "Event_companyId_idx" ON "Event"("companyId");
