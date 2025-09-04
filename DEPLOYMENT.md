# 🚀 公共のキョウシツ - デプロイ手順書

## 📋 前提条件

- GitHubアカウント
- Vercelアカウント
- Supabaseアカウント

## 🗄️ Step 1: Supabaseデータベース設定

### 1.1 プロジェクト作成
1. [Supabase](https://supabase.com)にアクセス
2. 「New Project」をクリック
3. プロジェクト名: `kokyou-no-kyoushitsu`
4. データベースパスワードを設定
5. リージョン: `Asia Pacific (Tokyo)`を選択
6. 「Create new project」をクリック

### 1.2 データベースセットアップ
1. プロジェクトダッシュボードで「SQL Editor」を開く
2. `supabase-schema.sql`の内容をコピー&ペースト
3. 「RUN」をクリックしてテーブル作成を実行

```sql
-- セッションテーブル
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code TEXT NOT NULL UNIQUE,
  class_name TEXT NOT NULL,
  date DATE NOT NULL,
  period INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  teacher_topic_title TEXT,
  teacher_topic_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- 参加者テーブル
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_id TEXT,
  seat_position INTEGER CHECK (seat_position BETWEEN 1 AND 42),
  topic_title TEXT,
  topic_content TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, student_name),
  UNIQUE(session_id, seat_position)
);

-- チャットメッセージテーブル
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_teacher BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- トピックリアクションテーブル
CREATE TABLE topic_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  reactor_name TEXT NOT NULL,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'view')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_id, reactor_name, reaction_type)
);

-- トピックコメントテーブル
CREATE TABLE topic_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  commenter_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS設定
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_comments ENABLE ROW LEVEL SECURITY;

-- 全ユーザーアクセス許可（教育現場向け）
CREATE POLICY "Allow all access" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all access" ON participants FOR ALL USING (true);
CREATE POLICY "Allow all access" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all access" ON topic_reactions FOR ALL USING (true);
CREATE POLICY "Allow all access" ON topic_comments FOR ALL USING (true);
```

### 1.3 API認証情報取得
1. 「Settings」→「API」を開く
2. 以下の情報をコピー：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🚀 Step 2: Vercelデプロイ

### 2.1 GitHubリポジトリ作成
1. GitHubで新しいリポジトリ作成: `kokyou-no-kyoushitsu`
2. ローカルでリモート追加とプッシュ:
```bash
git remote add origin https://github.com/[username]/kokyou-no-kyoushitsu.git
git branch -M main
git push -u origin main
```

### 2.2 Vercelプロジェクト作成
1. [Vercel](https://vercel.com)にアクセス
2. 「Import Project」をクリック
3. GitHubリポジトリ`kokyou-no-kyoushitsu`を選択
4. Framework: 「Next.js」を選択
5. 「Deploy」をクリック

### 2.3 環境変数設定
1. Vercelプロジェクトダッシュボードで「Settings」→「Environment Variables」
2. 以下の環境変数を追加：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabaseの Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseの anon public key |

### 2.4 カスタムドメイン設定（オプション）
1. 「Settings」→「Domains」
2. 独自ドメインを設定可能

## ✅ Step 3: デプロイ完了確認

### 3.1 動作確認
1. Vercelデプロイ完了後のURLにアクセス
2. 以下の機能をテスト：
   - トップページ表示
   - 教師セッション作成
   - 生徒セッション参加
   - 座席選択機能
   - トピック提出機能

### 3.2 本番環境設定
1. Supabase設定で`isDemo = false`に変更（本番利用時）
2. セキュリティ設定確認
3. バックアップ設定（必要に応じて）

## 🎯 利用開始

### 教師の使い方
1. `/teacher`ページでセッション作成
2. 8桁クラスコードを生徒に共有
3. `/teacher/dashboard/[セッションコード]`で管理

### 生徒の使い方
1. トップページでクラスコード入力
2. 名前・出席番号入力
3. 座席選択後、授業参加

## 🔧 トラブルシューティング

### データベースエラー
- Supabase接続確認
- 環境変数設定確認
- RLSポリシー確認

### ビルドエラー
- Node.jsバージョン確認 (18以上推奨)
- 依存関係の再インストール
- TypeScriptエラー確認

### パフォーマンス問題
- Vercelダッシュボードでメトリクス確認
- 画像最適化設定
- バンドルサイズ分析

## 📱 PWAインストール

デプロイ完了後、生徒・教師はブラウザからPWAとしてインストール可能：
- Chromeで「アプリをインストール」
- ホーム画面に追加してオフライン利用

## 📞 サポート

技術的な問題が発生した場合：
1. Vercelログ確認
2. Supabaseログ確認
3. ブラウザコンソールエラー確認