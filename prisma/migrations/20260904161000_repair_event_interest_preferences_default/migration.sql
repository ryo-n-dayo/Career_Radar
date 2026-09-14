-- SQLiteの既存行に空文字として入ったJSON列を、Prismaが読める空配列へ修復する。
UPDATE "InterestProfile"
SET "eventTopics" = '[]'
WHERE "eventTopics" IS NULL OR trim("eventTopics") = '';

UPDATE "InterestProfile"
SET "eventPeople" = '[]'
WHERE "eventPeople" IS NULL OR trim("eventPeople") = '';

UPDATE "InterestProfile"
SET "eventTalks" = '[]'
WHERE "eventTalks" IS NULL OR trim("eventTalks") = '';
