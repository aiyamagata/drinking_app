# デプロイ手順（休肝日チャレンジ）

## 前提
- Supabase プロジェクトが作成済み
- Vercel アカウント（無料でOK）

---

## 1. Supabase で認証を有効化

1. Supabase ダッシュボード → **Authentication** → **Providers**
2. **Email** を有効化
3. （任意）**Confirm email** をオフにすると、メール確認なしで即ログイン可能（開発時はオフ推奨）
4. **Site URL** を設定：
   - ローカル: `http://localhost:5173`
   - 本番: `https://あなたのドメイン.vercel.app`

---

## 2. マイグレーションの実行

Supabase ダッシュボード → **SQL Editor** で、以下の順に実行：

1. `supabase/migrations/20260212000000_add_auth_and_user_id.sql` の内容をコピーして実行

または CLI の場合：

```bash
supabase db push
```

---

## 3. Vercel にデプロイ

### 方法A: Vercel CLI（推奨）

1. Vercel CLI をインストール
   ```bash
   npm i -g vercel
   ```

2. ログイン
   ```bash
   vercel login
   ```

3. デプロイ
   ```bash
   vercel
   ```

4. 初回は対話形式で設定。プロジェクト名・ドメインを確認

5. 環境変数を設定
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```
   - `VITE_SUPABASE_URL`: Supabase の Project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase の anon public key

6. 再デプロイ（環境変数を反映）
   ```bash
   vercel --prod
   ```

### 方法B: GitHub 連携

**詳細な手順は `DEPLOY_GITHUB_VERCEL.md` を参照してください。**（初心者向け・丁寧な説明）

概要：
1. プロジェクトを GitHub にプッシュ
2. [vercel.com](https://vercel.com) にログイン
3. **New Project** → リポジトリを選択
4. **Framework Preset**: Vite
5. **Environment Variables** に追加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. **Deploy**

---

## 4. Supabase の Site URL を更新

デプロイ後、Supabase の **Authentication** → **URL Configuration** で：

- **Site URL**: `https://あなたのアプリ.vercel.app`
- **Redirect URLs**: 上記を追加

---

## 5. 動作確認

1. デプロイされた URL にアクセス
2. 新規登録 → ログイン
3. ホーム・カレンダー・目標設定が正常に動くか確認

---

## トラブルシューティング

### ログインできない
- Supabase の **Authentication** → **Providers** で Email が有効か確認
- **Confirm email** がオンの場合、メール内のリンクをクリックして確認

### 403 / RLS エラー
- マイグレーションが正しく実行されているか確認
- Supabase の **Table Editor** で `daily_records` と `goals` に `user_id` があるか確認

### 環境変数が反映されない
- Vercel で環境変数追加後、再デプロイが必要
- 変数名は `VITE_` で始まること（Vite がビルド時に埋め込む）
