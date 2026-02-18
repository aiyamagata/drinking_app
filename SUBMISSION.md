# 休肝日チャレンジ Webアプリ 課題提出まとめ

## 1. プロジェクト概要

### アプリ名
**休肝日チャレンジ**（Drink Break Tracker）

### 目的
お酒好きの人が「禁酒」ではなく「健康的に飲み続ける」ための習慣づくりを支援するWebアプリ。ズボラな人でも続けられるよう、入力負荷を最小化した設計。

### 想定ユーザー
- 30〜50代、男女
- 飲酒頻度：ほぼ毎日
- 課題：二日酔い、健康診断の肝臓値、将来の健康不安

---

## 2. 実装した機能一覧

### 2-1. MVP機能

| 機能 | 実装内容 |
|------|----------|
| **休肝日トラッキング** | 1日単位で「休肝日／飲酒／未入力」を記録 |
| **週・月目標設定** | 週目標（0〜7日、初期2）、月目標（0〜31日、初期8）を設定・保存 |
| **目標進捗の可視化** | 週・月の「達成数/目標数」表示＋進捗バー |
| **ホーム画面** | 今日の状態をワンタップで変更、週・月目標の進捗、直近7日のミニカレンダー |
| **カレンダー画面** | 月ビュー、色分け表示（休肝=グリーン、飲酒=オレンジ、未入力=グレー）、日付タップで状態変更 |
| **目標設定画面** | スライダーで週・月目標を設定し、保存 |

### 2-2. AI活用

| 機能 | 実装内容 |
|------|----------|
| **AIメッセージ** | 週次まとめ・励まし・Tips を DB から表示 |
| **Edge Function** | `generate-ai-messages` で OpenAI Responses API を使用し、ギャル調の励ましメッセージを生成 |
| **自動実行** | pg_cron + pg_net で週1回自動実行 |
| **フォールバック** | DB にメッセージがない場合はルールベースのメッセージを表示 |

### 2-3. ゲーム性（キャラ育成）

| 機能 | 実装内容 |
|------|----------|
| **10段階進化** | 休肝日数に応じてキャラが Lv.1〜Lv.10 に進化 |
| **月リセット** | レベルは月ごとにリセット（今月の休肝日数で計算） |
| **キャラ表示** | ホーム画面上部にキャラアイコン・レベル・段階名を表示 |
| **イラスト対応** | レベルごとの画像差し替え可能（public/images/level1.png〜level10.png） |

### 2-4. 認証・マルチユーザー

| 機能 | 実装内容 |
|------|----------|
| **Supabase Auth** | メール/パスワードによるログイン・新規登録 |
| **ユーザー分離** | daily_records、goals を user_id で紐付け、RLS で他ユーザーのデータにアクセス不可 |
| **初回初期データ** | サインアップ時に profiles と goals の初期データを自動作成 |
| **ログイン画面** | ログイン/新規登録の切り替え、ログアウトボタン |

### 2-5. その他

| 機能 | 実装内容 |
|------|----------|
| **日付のJST対応** | toLocalDateString() で日付表示・保存を JST に統一 |
| **カレンダー月曜始まり** | 週を月曜〜日曜で表示 |
| **フォント** | Zen Maru Gothic（Google Fonts）を適用 |
| **レスポンシブUI** | パステル基調、丸みのあるUI、スマホでも利用しやすいレイアウト |

---

## 3. 技術スタック

| カテゴリ | 技術 |
|----------|------|
| **フロントエンド** | React 18、TypeScript、Vite |
| **スタイリング** | Tailwind CSS |
| **バックエンド/DB** | Supabase（PostgreSQL、認証、Edge Functions） |
| **AI** | OpenAI Responses API（text.format で JSON 出力） |
| **スケジューリング** | pg_cron、pg_net（Supabase 上で週1実行） |
| **デプロイ** | Vercel（GitHub 連携、自動デプロイ） |
| **バージョン管理** | Git、GitHub（https://github.com/aiyamagata/drinking_app） |

---

## 4. システム構成

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   ブラウザ       │     │     Vercel       │     │    Supabase     │
│  (React App)    │────▶│  (静的ホスティング) │     │  (BaaS)         │
└─────────────────┘     └──────────────────┘     │                 │
        │                        │               │  - Auth         │
        │                        │               │  - PostgreSQL   │
        └────────────────────────┴───────────────│  - Edge Func    │
                                                 │  - Storage      │
                                                 └────────┬────────┘
                                                          │
                                                 ┌────────▼────────┐
                                                 │  OpenAI API     │
                                                 │  (AI生成)       │
                                                 └─────────────────┘
```

---

## 5. データベース設計

### テーブル一覧

| テーブル | 説明 | 主なカラム |
|----------|------|------------|
| **profiles** | ユーザープロファイル | id（auth.users連携）、created_at |
| **daily_records** | 日別の記録 | user_id、date、status（rest/drink/unset） |
| **goals** | 週・月目標 | user_id、weekly_goal、monthly_goal、character_level |
| **ai_messages** | AI生成メッセージ | message_type、content、created_at |

### RLS（Row Level Security）
- daily_records、goals、profiles で RLS を有効化
- 認証ユーザーは自分のデータ（user_id = auth.uid()）のみアクセス可能

---

## 6. 主要ファイル構成

```
drinking_app/
├── src/
│   ├── App.tsx                 # ルート、認証判定、画面切り替え
│   ├── main.tsx                # エントリ、AuthProvider
│   ├── components/
│   │   ├── Home.tsx            # ホーム画面
│   │   ├── Calendar.tsx        # カレンダー画面
│   │   ├── Settings.tsx        # 目標設定画面
│   │   ├── Login.tsx           # ログイン・新規登録画面
│   │   └── Character.tsx       # キャラ表示コンポーネント
│   ├── contexts/
│   │   └── AuthContext.tsx     # 認証状態管理
│   ├── lib/
│   │   ├── supabase.ts         # Supabase クライアント
│   │   ├── db.ts               # DB 操作
│   │   └── utils.ts            # ユーティリティ
│   └── types/
│       └── index.ts            # 型定義
├── supabase/
│   ├── migrations/             # DB マイグレーション
│   └── functions/
│       └── generate-ai-messages/  # Edge Function
├── public/
│   └── images/                 # キャライラスト
├── vercel.json                 # Vercel 設定
├── REQUIREMENTS.md             # 要件定義
├── DEPLOY_GITHUB_VERCEL.md     # デプロイ手順
└── SUBMISSION.md               # 本ドキュメント
```

---

## 7. デプロイ状況

| 項目 | 内容 |
|------|------|
| **本番URL** | Vercel にデプロイ済み（URL はデプロイ時に発行） |
| **リポジトリ** | https://github.com/aiyamagata/drinking_app |
| **環境変数** | VITE_SUPABASE_URL、VITE_SUPABASE_ANON_KEY を Vercel で設定 |
| **自動デプロイ** | main ブランチへの push で Vercel が自動ビルド・デプロイ |

---

## 8. 開発の経緯・工夫

### 開発プロセス
- Bolt.new で MVP UI をプロトタイピング
- Cursor に移行し、認証・ゲーム性・デプロイを実装

### 工夫した点
1. **日付のJST対応**：toISOString() の UTC ずれを回避し、日本時間で一貫した記録
2. **AIメッセージの二重化**：DB にメッセージがあれば表示、なければルールベースでフォールバック
3. **キャラレベルの月リセット**：毎月リセットすることで継続モチベーションを維持
4. **認証付きマルチユーザー**：RLS でデータを完全に分離し、本番運用を想定した設計

---

## 9. 今後の拡張候補

| 優先度 | 内容 |
|--------|------|
| 中 | まとめて入力（複数日を一括で記録） |
| 中 | AI記録補助（「今週も月曜休肝で良い？」など推測・提案） |
| 低 | 連続記録の救済（1回飲酒しても連続継続扱い） |
| 低 | ユーザーごとの AI メッセージ最適化 |

---

## 10. 参考資料

- 要件定義：`REQUIREMENTS.md`
- 引き継ぎ・次にやること：`HANDOVER.md`
- デプロイ手順：`DEPLOY_GITHUB_VERCEL.md`、`DEPLOY.md`

---

以上
