# 引き継ぎまとめ（drinking_app）

明日以降、初心者でも迷わず続きから作業できるように要点をまとめました。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| アプリの目的 | お酒好き向けの**健康管理アプリ**（休肝日トラッキング） |
| MVP画面 | **ホーム** / **カレンダー** / **目標設定** |
| バックエンド | **Supabase**（DB・認証・Edge Functions） |
| こだわり | AIメッセージを**ギャル調・短文**でDBから読み込み表示 |

くわしい仕様は **`REQUIREMENTS.md`** にあります。

---

## 2. 現在の状態（どこまでできているか）

### Supabaseのテーブル

- **daily_records** … 日ごとの記録（休肝/飲酒/未入力）
- **goals** … 週目標・月目標（**1行だけ**に統一、固定IDで管理）
- **ai_messages** … AIが生成したメッセージ（週次まとめ・励まし・Tips）

### ローカル開発

- 作業ディレクトリは **`drinking_app`**（このフォルダを開いて作業）
- 日付ずれは修正済み：`toISOString()` のUTCずれをやめて、**`toLocalDateString()`** でJSTの日付を表示・保存するように変更済み

---

## 3. 直近の課題と対処（明日やることの前提）

### 課題① npm run dev が Node v14 で失敗する

- **原因**：Node v14 では動かない（**Node v20以上**が必要）
- **対処**：Conda の環境が Node を上書きしている場合は、**Conda をオフ**にしてシステムの Node を使う（下記「次にやること」で手順を記載）

### 課題② 日付ずれ

- **対応済み**：`toLocalDateString()` / `parseLocalDateString()` を導入し、表示・保存は JST で正しくなっている

---

## 4. AIメッセージの仕組み（把握用）

1. **Edge Function**  
   `supabase/functions/generate-ai-messages` を作成済み。  
   **OpenAI Responses API**（`text.format` で JSON）を使ってメッセージを生成。

2. **Supabase Secrets**  
   以下を設定済み。  
   - OpenAI API キー  
   - Supabase URL  
   - Supabase Service Role Key  

3. **動作確認**  
   Supabase ダッシュボードの **Edge Functions → generate-ai-messages → Test** で実行し、成功している。  
   **ai_messages** に 3 種類（`weekly_summary` / `encouragement` / `daily_tip`）が入ることを確認済み。

4. **アプリ側**  
   `Home.tsx` で、DB にメッセージがあればそれを表示、なければルールベースのフォールバックを表示。

---

## 5. 重要注意（セキュリティ）

過去のターミナルログに **OpenAI キーや Supabase キーが出てしまった**可能性があります。  
**OpenAI キーと Supabase のキー（anon / service_role）のローテーション（再発行・差し替え）を推奨**します。

- OpenAI: ダッシュボードでキー再発行 → Supabase Secrets を更新  
- Supabase: Project Settings → API でキー確認し、必要なら再発行 → `.env` と Secrets を更新  

---

## 6. 主要ファイル（変更内容の把握用）

| ファイル | 役割 |
|----------|------|
| `src/lib/utils.ts` | `toLocalDateString` / `parseLocalDateString`、ギャル調の Tips/励ましのフォールバックロジック |
| `src/components/Home.tsx` | AIメッセージ表示（DB 優先、なければルールベース） |
| `src/lib/db.ts` | goals を 1 行で管理、`getLatestAiMessages` 追加 |
| `src/types/index.ts` | `AiMessage` 型追加 |
| `supabase/functions/generate-ai-messages/index.ts` | Edge Function（OpenAI Responses API でメッセージ生成） |

---

## 7. 次にやること（明日以降の手順）

### ステップ1：ローカル開発環境の復旧

ターミナルで、**drinking_app のフォルダにいる状態**で次を実行します。

1. **Conda をオフにする**  
   ```bash
   conda deactivate
   ```

2. **パスを通す**（Conda 以外の Node を使うため）  
   ```bash
   export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
   ```

3. **Node のバージョン確認**  
   ```bash
   node -v
   ```  
   **v20 以上**（例: v20.x.x, v22.x.x）なら OK です。

4. **依存関係のインストールと開発サーバー起動**  
   ```bash
   npm install
   npm run dev
   ```  
   ブラウザで表示される URL（例: http://localhost:5173）にアクセスし、アプリが開けば成功です。

---

### ステップ2：ホーム画面で AI 文の表示確認

1. アプリの **ホーム画面** を開く。  
2. **AI メッセージ**（週次まとめ・励まし・Tips など）が表示されているか確認。  
3. DB（ai_messages）にデータがあれば DB の文が、なければルールベースの文が表示される想定です。  
4. 表示がおかしい・出ない場合は、`src/components/Home.tsx` と `src/lib/db.ts` の `getLatestAiMessages` の呼び出しを確認。

---

### ステップ3：週1で自動実行する（Supabase Scheduled Functions）

**目的**：`generate-ai-messages` を **週に1回** 自動で実行し、ai_messages を更新する。

1. Supabase ダッシュボードで **Database → Extensions** を開く。  
2. **pg_cron** が有効か確認。無ければ有効化。  
3. **Database → SQL Editor** で、週1実行のスケジュールを追加する。  
   - 例：毎週月曜 9:00 JST に Edge Function を呼ぶ場合は、  
     **pg_net** や **HTTP リクエストを送る仕組み** と **cron** を組み合わせます。  
   - Supabase の「Scheduled Functions」や「Cron Jobs」のドキュメントを参照し、  
     `generate-ai-messages` の **POST** を週1で叩く設定を追加。  

※ 設定方法は Supabase のバージョン・UI で文言が少し変わる場合があります。  
「Supabase cron schedule function」などで検索すると最新の手順が出ます。

---

## 8. 困ったときの参照

- **仕様・要件** → `REQUIREMENTS.md`  
- **Node / Conda で開発サーバーが起動しない** → 本ファイルの「ステップ1」  
- **日付やテーブル名** → 実際のテーブルは `daily_records` など。REQUIREMENTS の `daily_logs` は古い名前の可能性があるので、**マイグレーション**（`supabase/migrations/`）と **db.ts** を基準に確認してください。

---

お疲れさまでした。また明日、このファイルを開いてから続きの作業をするとスムーズです。
