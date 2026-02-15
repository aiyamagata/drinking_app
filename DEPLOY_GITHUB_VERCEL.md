# GitHub × Vercel でデプロイする手順（初心者向け）

このドキュメントは、GitHub と Vercel を使って休肝日チャレンジを公開する手順を、一つひとつ丁寧に説明します。

---

## 準備するもの

- [ ] GitHub アカウント（ない場合は https://github.com で無料作成）
- [ ] Vercel アカウント（ない場合は https://vercel.com で無料作成）
- [ ] Supabase の Project URL と anon key（後述で取得方法を説明）

---

## ステップ1：Supabase の情報をメモする

デプロイ時に必要になるので、先に準備しておきます。

1. **Supabase ダッシュボード**を開く  
   https://supabase.com/dashboard

2. プロジェクトを選択

3. 左メニューの **Project Settings**（歯車アイコン）をクリック

4. **API** をクリック

5. 次の2つをメモまたはコピー
   - **Project URL**  
     例: `https://abcdefghijk.supabase.co`
   - **anon public**（anon key）  
     「Project API keys」の `anon` の右側にある「Reveal」をクリックして表示し、コピー

```
┌─────────────────────────────────────────────────────┐
│  Project Settings > API                             │
├─────────────────────────────────────────────────────┤
│  Project URL                                        │
│  https://xxxxx.supabase.co          [コピー]        │
│                                                     │
│  Project API keys                                   │
│  anon   sk-xxxxx...                [Reveal] [コピー]│
└─────────────────────────────────────────────────────┘
```

---

## ステップ2：プロジェクトを GitHub にプッシュする

### 2-1. GitHub で新しいリポジトリを作成

1. https://github.com にログイン

2. 右上の **「+」** → **「New repository」** をクリック

3. 以下を入力
   - **Repository name**: `drinking_app`（または好きな名前）
   - **Visibility**: Public
   - **「Create repository」** をクリック

4. 作成後、表示される URL をメモ  
   例: `https://github.com/あなたのユーザー名/drinking_app`

### 2-2. ローカルのプロジェクトを GitHub にプッシュ

1. **Cursor** または **ターミナル** を開く

2. プロジェクトフォルダに移動
   ```bash
   cd /Users/yamagataai/Desktop/drinking_app/drinking_app
   ```

3. 既に Git が初期化されているか確認
   ```bash
   git status
   ```
   「not a git repository」と出たら、次で初期化：
   ```bash
   git init
   ```

4. リモート（GitHub）を設定  
   `あなたのユーザー名` と `drinking_app` は、ステップ2-1で作成したリポジトリ名に合わせて書き換えてください。
   ```bash
   git remote add origin https://github.com/あなたのユーザー名/drinking_app.git
   ```
   すでに `origin` がある場合は、次のように変更：
   ```bash
   git remote set-url origin https://github.com/あなたのユーザー名/drinking_app.git
   ```

5. 変更をコミットしてプッシュ
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git branch -M main
   git push -u origin main
   ```

6. 途中で GitHub のログインを求められたら、案内に従ってログインする

7. GitHub のリポジトリページを開き、ファイルがアップロードされていることを確認する

---

## ステップ3：Vercel でプロジェクトを作成する

1. https://vercel.com を開く

2. 右上の **「Sign Up」** または **「Log In」** でログイン  
   （GitHub アカウントでログインすると後で楽です）

3. **「Add New...」** → **「Project」** をクリック

4. **「Import Git Repository」** で GitHub のリポジトリ一覧が表示される

5. `drinking_app`（または作成したリポジトリ名）を探して **「Import」** をクリック

6. 設定画面で以下を確認・設定

   | 項目 | 内容 |
   |------|------|
   | **Project Name** | `drinking_app` のまま or 好きな名前 |
   | **Framework Preset** | **Vite** を選択 |
   | **Root Directory** | そのまま（空） |
   | **Build and Output Settings** | そのまま（Vite で自動設定される） |

7. **「Environment Variables」** を展開する

8. 次の2つの変数を追加する

   **1つ目**
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: ステップ1でコピーした **Project URL**
   - **Environment**: Production, Preview, Development すべてにチェック

   **2つ目**
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: ステップ1でコピーした **anon public key**
   - **Environment**: Production, Preview, Development すべてにチェック

9. **「Deploy」** をクリック

10. ビルドが始まり、数十秒〜1分ほど待つ

11. **「Congratulations!」** と表示されたら完了

12. **「Visit」** または表示された URL（例: `https://drinking-app-xxx.vercel.app`）をクリックして、アプリが開くか確認する

---

## ステップ4：Supabase の URL を設定する

デプロイした URL で認証が動くように、Supabase に設定します。

1. **Supabase ダッシュボード** → **Authentication** → **URL Configuration**

2. **Site URL** を次のように設定  
   例: `https://drinking-app-xxx.vercel.app`  
   （Vercel で表示された URL をそのまま入力）

3. **Redirect URLs** に次の行を追加
   ```
   https://drinking-app-xxx.vercel.app/**
   https://drinking-app-xxx.vercel.app
   ```
   （`drinking-app-xxx` は実際のプロジェクト名に合わせて書き換える）

4. **「Save」** をクリック

---

## ステップ5：動作確認

1. Vercel の URL にアクセス

2. **ログイン画面** が表示されることを確認

3. **「新規登録はこちら」** をクリック

4. メールアドレスとパスワード（6文字以上）を入力して登録

5. ログインできること、ホーム・カレンダー・目標設定が使えることを確認

---

## うまくいかないとき

### ログインできない
- Supabase → **Authentication** → **Providers** で **Email** が有効か確認
- **Confirm email** をオフにすると、メール確認なしでログインできる（開発・テスト向け）

### 真っ白な画面になる
- ブラウザの開発者ツール（F12）→ Console でエラーを確認
- Vercel の環境変数が正しく設定されているか確認
- Vercel の **Deployments** → 最新のデプロイ → **Redeploy** で再デプロイ

### ビルドエラーになる
- Vercel の **Deployments** → 失敗したデプロイ → **View Build Logs** でエラー内容を確認
- ローカルで `npm run build` が成功するか確認

---

## 今後の更新方法

コードを変更したら、次のコマンドで GitHub にプッシュすると、Vercel が自動で再デプロイします。

```bash
cd /Users/yamagataai/Desktop/drinking_app/drinking_app
git add .
git commit -m "更新内容の説明"
git push
```

---

お疲れさまでした。デプロイが完了したら、URL を友達に共有して使ってもらえます。
