-- DailyNews: 公式採用ページで現在確認できる募集を管理する
ALTER TABLE "Candidate" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Candidate" ADD COLUMN "lastSeenAt" DATETIME;
CREATE INDEX "Candidate_isActive_kind_lastSeenAt_idx" ON "Candidate"("isActive", "kind", "lastSeenAt");
