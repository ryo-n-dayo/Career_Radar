-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'UPDATE',
    "score" INTEGER NOT NULL DEFAULT 0,
    "reasons" JSONB NOT NULL DEFAULT [],
    "publishedAt" DATETIME,
    "deadline" DATETIME,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "contentHash" TEXT NOT NULL,
    "feedbackValue" INTEGER,
    "feedbackReason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" DATETIME,
    CONSTRAINT "Candidate_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WatchSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "updatedAt" DATETIME NOT NULL,
    "careersUrl" TEXT,
    "xHandle" TEXT
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

-- CreateTable
CREATE TABLE "GoogleCalendarEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "connectionId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "calendarName" TEXT,
    "summary" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "htmlLink" TEXT,
    "googleUpdatedAt" DATETIME,
    "status" TEXT,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoogleCalendarEvent_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "GoogleConnection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoogleConnection" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'google',
    "email" TEXT,
    "accessTokenCiphertext" TEXT NOT NULL,
    "refreshTokenCiphertext" TEXT,
    "tokenExpiresAt" DATETIME,
    "scopes" JSONB NOT NULL DEFAULT [],
    "gmailLastSyncedAt" DATETIME,
    "calendarLastSyncedAt" DATETIME,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GoogleGmailMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "connectionId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "threadId" TEXT,
    "fromAddress" TEXT,
    "subject" TEXT NOT NULL,
    "snippet" TEXT,
    "receivedAt" DATETIME,
    "labels" JSONB NOT NULL DEFAULT [],
    "gmailUrl" TEXT,
    "isRelevant" BOOLEAN NOT NULL DEFAULT true,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoogleGmailMessage_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "GoogleConnection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterestProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "includeKeywords" JSONB NOT NULL DEFAULT [],
    "excludeKeywords" JSONB NOT NULL DEFAULT [],
    "updatedAt" DATETIME NOT NULL,
    "selectedTopics" JSONB NOT NULL DEFAULT [],
    "topicHistory" JSONB NOT NULL DEFAULT [],
    "eventTopics" JSONB NOT NULL DEFAULT [],
    "eventPeople" JSONB NOT NULL DEFAULT [],
    "eventTalks" JSONB NOT NULL DEFAULT []
);

-- CreateTable
CREATE TABLE "MeetupPlan" (
    "url" TEXT NOT NULL PRIMARY KEY,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "people" TEXT NOT NULL DEFAULT '',
    "talks" TEXT NOT NULL DEFAULT '',
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
    "lastExternalId" TEXT,
    CONSTRAINT "WatchSource_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "XUsageDaily" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateKey" TEXT NOT NULL,
    "postsRead" INTEGER NOT NULL DEFAULT 0,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostUsd" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Candidate_isActive_kind_lastSeenAt_idx" ON "Candidate"("isActive", "kind", "lastSeenAt");

-- CreateIndex
CREATE INDEX "Candidate_feedbackValue_detectedAt_idx" ON "Candidate"("feedbackValue", "detectedAt");

-- CreateIndex
CREATE INDEX "Candidate_sourceId_idx" ON "Candidate"("sourceId");

-- CreateIndex
CREATE INDEX "Candidate_status_score_detectedAt_idx" ON "Candidate"("status", "score", "detectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_sourceId_url_contentHash_key" ON "Candidate"("sourceId", "url", "contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Event_url_key" ON "Event"("url");

-- CreateIndex
CREATE INDEX "Event_companyId_idx" ON "Event"("companyId");

-- CreateIndex
CREATE INDEX "Event_kind_startsAt_idx" ON "Event"("kind", "startsAt");

-- CreateIndex
CREATE INDEX "Event_applyDeadline_idx" ON "Event"("applyDeadline");

-- CreateIndex
CREATE INDEX "Event_startsAt_idx" ON "Event"("startsAt");

-- CreateIndex
CREATE INDEX "GoogleCalendarEvent_connectionId_startsAt_idx" ON "GoogleCalendarEvent"("connectionId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarEvent_connectionId_externalId_key" ON "GoogleCalendarEvent"("connectionId", "externalId");

-- CreateIndex
CREATE INDEX "GoogleGmailMessage_connectionId_isRelevant_receivedAt_idx" ON "GoogleGmailMessage"("connectionId", "isRelevant", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleGmailMessage_connectionId_externalId_key" ON "GoogleGmailMessage"("connectionId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPost_url_key" ON "SavedPost"("url");

-- CreateIndex
CREATE INDEX "SavedPost_companyId_idx" ON "SavedPost"("companyId");

-- CreateIndex
CREATE INDEX "SavedPost_savedAt_idx" ON "SavedPost"("savedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WatchSource_url_key" ON "WatchSource"("url");

-- CreateIndex
CREATE INDEX "WatchSource_companyId_idx" ON "WatchSource"("companyId");

-- CreateIndex
CREATE INDEX "WatchSource_enabled_lastCheckedAt_idx" ON "WatchSource"("enabled", "lastCheckedAt");

-- CreateIndex
CREATE UNIQUE INDEX "XUsageDaily_dateKey_key" ON "XUsageDaily"("dateKey");

-- CreateIndex
CREATE INDEX "XUsageDaily_dateKey_idx" ON "XUsageDaily"("dateKey");

