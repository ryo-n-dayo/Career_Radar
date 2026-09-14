-- DailyNews: 選択した興味トピックの履歴をPC内に保存する
ALTER TABLE "InterestProfile" ADD COLUMN "topicHistory" JSONB NOT NULL DEFAULT [];
