# 休肝日チャレンジ

お酒好きの人が「禁酒」ではなく「健康的に飲み続ける」ための習慣づくりを支援するWebアプリです。

## 概要

- **休肝日（飲まない日）を記録**して、週・月の目標達成を可視化
- **ギャル調のAIメッセージ**で励まし・Tipsを表示
- **キャラ育成ゲーム性**（休肝日数で10段階進化、月リセット）
- **認証付きマルチユーザー**対応（Supabase Auth）

## 主な機能

| 機能 | 説明 |
|------|------|
| 休肝日トラッキング | 1日単位で「休肝日／飲酒／未入力」を記録 |
| 週・月目標 | 週目標（0〜7日）、月目標（0〜31日）を設定・進捗表示 |
| カレンダー | 月ビューで色分け表示、日付タップで記録変更 |
| AIメッセージ | 週次まとめ・励まし・Tips（DB or ルールベース） |
| キャラ育成 | 休肝日数に応じてLv.1〜10に進化（月リセット） |
| ログイン/新規登録 | メール・パスワードで認証 |

## 技術スタック

- **フロントエンド**: React 18, TypeScript, Vite, Tailwind CSS
- **バックエンド**: Supabase（PostgreSQL, Auth, Edge Functions）
- **AI**: OpenAI Responses API
- **デプロイ**: Vercel（GitHub 連携）

## セットアップ

### 必要環境

- Node.js v20 以上
- npm

### 手順

```bash
# リポジトリをクローン
git clone https://github.com/aiyamagata/drinking_app.git
cd drinking_app

# 依存関係をインストール
npm install

# 環境変数を設定（.env を作成）
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:5173 を開く。

### Anaconda 環境で Node エラーが出る場合

```bash
conda deactivate
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
node -v  # v20以上を確認
npm run dev
```

## プロジェクト構成

```
src/
├── components/     # Home, Calendar, Settings, Login, Character
├── contexts/       # AuthContext（認証状態）
├── lib/            # supabase, db, utils
└── types/          # 型定義

supabase/
├── migrations/     # DB マイグレーション
└── functions/      # generate-ai-messages（Edge Function）
```

## 関連ドキュメント

| ファイル | 内容 |
|----------|------|
| `REQUIREMENTS.md` | 要件定義・仕様 |
| `HANDOVER.md` | 引き継ぎ・次にやること |
| `DEPLOY_GITHUB_VERCEL.md` | GitHub × Vercel デプロイ手順（初心者向け） |
| `DEPLOY.md` | デプロイ概要 |
| `SUBMISSION.md` | 課題提出用まとめ |

## ライセンス

Private

---

© drinking_app
