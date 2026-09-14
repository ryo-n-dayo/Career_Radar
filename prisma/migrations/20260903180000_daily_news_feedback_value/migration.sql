-- DailyNews: 投稿ごとの興味度を5段階で保存し、学習に使う
ALTER TABLE "Candidate" ADD COLUMN "feedbackValue" INTEGER;
CREATE INDEX "Candidate_feedbackValue_detectedAt_idx" ON "Candidate"("feedbackValue", "detectedAt");
