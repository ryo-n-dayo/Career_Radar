-- AlterTable
ALTER TABLE "Company" ADD COLUMN "profile" JSONB;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "deadline" DATETIME,
    "deadlineLabel" TEXT,
    "aiHeat" INTEGER,
    "keywords" JSONB,
    "sources" JSONB,
    "trust" TEXT NOT NULL DEFAULT 'needs_review',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Event_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("category", "companyId", "content", "createdAt", "deadline", "endsAt", "id", "startsAt", "status", "title", "updatedAt", "userId") SELECT "category", "companyId", "content", "createdAt", "deadline", "endsAt", "id", "startsAt", "status", "title", "updatedAt", "userId" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_companyId_deadline_idx" ON "Event"("companyId", "deadline");
CREATE INDEX "Event_userId_status_idx" ON "Event"("userId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
