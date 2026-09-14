-- 履歴機能の導入前から選ばれていた現在の話題を、最初の履歴として残す
UPDATE "InterestProfile"
SET "topicHistory" = json_array(
  json_object(
    'topicIds', json("selectedTopics"),
    'selectedAt', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
)
WHERE json_array_length("selectedTopics") > 0
  AND json_array_length("topicHistory") = 0;
