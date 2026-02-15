/*
  既に存在するポリシーを一度削除してから作り直す
  「already exists」エラーが出た場合に実行
*/

-- 既存ポリシーを削除（あれば）
DROP POLICY IF EXISTS "Users can manage own daily_records" ON daily_records;
DROP POLICY IF EXISTS "Users can manage own goals" ON goals;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- ポリシーを再作成
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

-- トリガーも念のため再作成
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
