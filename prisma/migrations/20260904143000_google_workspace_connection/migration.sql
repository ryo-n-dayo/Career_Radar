-- Google OAuth の暗号化トークンと、最小限のGmail・CalendarメタデータをPC内SQLiteに保存する。
CREATE TABLE "GoogleConnection" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'google',
    "email" TEXT,
    "accessTokenCiphertext" TEXT NOT NULL,
    "refreshTokenCiphertext" TEXT,
    "tokenExpiresAt" DATETIME,
    "scopes" JSONB NOT NULL DEFAULT '[]',
    "gmailLastSyncedAt" DATETIME,
    "calendarLastSyncedAt" DATETIME,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "GoogleGmailMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "connectionId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "threadId" TEXT,
    "fromAddress" TEXT,
    "subject" TEXT NOT NULL,
    "snippet" TEXT,
    "receivedAt" DATETIME,
    "labels" JSONB NOT NULL DEFAULT '[]',
    "gmailUrl" TEXT,
    "isRelevant" BOOLEAN NOT NULL DEFAULT true,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoogleGmailMessage_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "GoogleConnection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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

CREATE UNIQUE INDEX "GoogleGmailMessage_connectionId_externalId_key" ON "GoogleGmailMessage"("connectionId", "externalId");
CREATE INDEX "GoogleGmailMessage_connectionId_isRelevant_receivedAt_idx" ON "GoogleGmailMessage"("connectionId", "isRelevant", "receivedAt");
CREATE UNIQUE INDEX "GoogleCalendarEvent_connectionId_externalId_key" ON "GoogleCalendarEvent"("connectionId", "externalId");
CREATE INDEX "GoogleCalendarEvent_connectionId_startsAt_idx" ON "GoogleCalendarEvent"("connectionId", "startsAt");
