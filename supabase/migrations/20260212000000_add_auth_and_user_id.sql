/*
  # 認証・マルチユーザー対応

  ## 変更内容
  1. profiles テーブル作成 (auth.users 連携)
  2. daily_records, goals に user_id 追加
  3. RLS ポリシーを認証ユーザー向けに変更
  4. サインアップ時に profiles 自動作成トリガー
*/

-- 1. profiles テーブル
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. daily_records に user_id 追加
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users ON DELETE CASCADE;

-- date の UNIQUE 制約を削除し、(user_id, date) の部分ユニークに
ALTER TABLE daily_records DROP CONSTRAINT IF EXISTS daily_records_date_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_records_user_date 
  ON daily_records (user_id, date) WHERE user_id IS NOT NULL;

-- 3. goals に user_id 追加 (既存の singleton 設計から 1ユーザー1行に変更)
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users ON DELETE CASCADE;

-- goals: 1ユーザー1行のユニーク制約
CREATE UNIQUE INDEX IF NOT EXISTS idx_goals_user_id ON goals (user_id) WHERE user_id IS NOT NULL;

-- 4. 既存の RLS ポリシーを削除
DROP POLICY IF EXISTS "Allow public read access to daily_records" ON daily_records;
DROP POLICY IF EXISTS "Allow public insert to daily_records" ON daily_records;
DROP POLICY IF EXISTS "Allow public update to daily_records" ON daily_records;
DROP POLICY IF EXISTS "Allow public delete from daily_records" ON daily_records;
DROP POLICY IF EXISTS "Allow public read access to goals" ON goals;
DROP POLICY IF EXISTS "Allow public insert to goals" ON goals;
DROP POLICY IF EXISTS "Allow public update to goals" ON goals;

-- 5. 認証ユーザー向け RLS ポリシー
CREATE POLICY "Users can manage own daily_records"
  ON daily_records FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own goals"
  ON goals FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- profiles の RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 6. サインアップ時に profiles と goals を自動作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (new.id);
  INSERT INTO public.goals (user_id, weekly_goal, monthly_goal, character_level)
  VALUES (new.id, 2, 8, 1);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
