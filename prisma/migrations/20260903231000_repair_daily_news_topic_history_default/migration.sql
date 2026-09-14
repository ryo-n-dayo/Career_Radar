-- SQLiteでJSONBの空配列デフォルトが空文字列になった既存行を補正する
UPDATE "InterestProfile"
SET "topicHistory" = '[]'
WHERE "topicHistory" IS NULL OR trim("topicHistory") = '';
