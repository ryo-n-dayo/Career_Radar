CREATE TABLE "MeetupPlan" (
    "url" TEXT NOT NULL PRIMARY KEY,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "people" TEXT NOT NULL DEFAULT '',
    "talks" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
