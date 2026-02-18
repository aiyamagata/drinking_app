/*
  daily_records / goals の upsert で 400 エラーが発生する問題の修正
  
  原因: 部分ユニークインデックス (WHERE user_id IS NOT NULL) は
        PostgREST/Supabase の upsert (ON CONFLICT) でサポートされない
  
  対応: 通常の UNIQUE 制約を追加（upsert で使用）
*/

-- daily_records
DROP INDEX IF EXISTS idx_daily_records_user_date;
ALTER TABLE daily_records DROP CONSTRAINT IF EXISTS daily_records_user_date_unique;
ALTER TABLE daily_records ADD CONSTRAINT daily_records_user_date_unique UNIQUE (user_id, date);

-- goals（同様の問題を予防）
DROP INDEX IF EXISTS idx_goals_user_id;
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_user_id_unique;
ALTER TABLE goals ADD CONSTRAINT goals_user_id_unique UNIQUE (user_id);
