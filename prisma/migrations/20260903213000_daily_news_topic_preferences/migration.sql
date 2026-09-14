-- DailyNews: 選択式の興味トピックをPC内に保存する
ALTER TABLE "InterestProfile" ADD COLUMN "selectedTopics" JSONB NOT NULL DEFAULT [];
