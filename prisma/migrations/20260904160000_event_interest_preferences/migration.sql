-- DailyNews: 技術イベント専用の興味条件をPC内に保存する
ALTER TABLE "InterestProfile" ADD COLUMN "eventTopics" JSONB NOT NULL DEFAULT [];
ALTER TABLE "InterestProfile" ADD COLUMN "eventPeople" JSONB NOT NULL DEFAULT [];
ALTER TABLE "InterestProfile" ADD COLUMN "eventTalks" JSONB NOT NULL DEFAULT [];
