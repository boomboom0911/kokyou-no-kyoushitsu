# 🏛️ 公共のキョウシツ

**民主主義授業支援プラットフォーム**

高校社会科における参加型学習を促進する革新的なWebアプリケーション

## 📋 プロジェクト概要

### 🎯 目的
- 高校社会科（公共・政治経済）の授業で生徒の主体的参加を促進
- 民主主義学習における対話と相互理解の支援
- Google非依存の完全無料プラットフォーム

### 👥 利用対象
- **教員**: 1名（社会科担当）
- **生徒**: 200名（40名×5クラス）
- **使用頻度**: 週2回、年間80回授業

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 14** - React 18ベース
- **TypeScript** - 型安全性とコード品質
- **Tailwind CSS** - レスポンシブデザイン
- **PWA対応** - オフライン機能とアプリ風動作

### バックエンド・データベース
- **Supabase PostgreSQL** - メインデータベース
- **Supabase Realtime** - WebSocket通信（座席表更新・チャット）
- **Supabase Auth** - 8桁クラスコード認証システム
- **Row Level Security (RLS)** - データセキュリティ

### インフラ・デプロイ
- **Vercel** - ホスティング・CI/CD
- **Vercel Edge Functions** - サーバーレスAPI
- **HTTPS自動対応** - セキュア通信

## 🚀 開発セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、以下を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. データベースセットアップ

SupabaseプロジェクトでSQL Editorを開き、`supabase-schema.sql` の内容を実行：

```sql
-- ファイル: supabase-schema.sql の内容をコピー&ペースト
```

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセス

## 📱 主要機能

### 🔑 8桁クラスコード認証
- Google非依存の独自認証システム
- 形式: `AB12CD34` (大文字2桁 + 数字2桁 × 2)
- セッション時間制限

### 🪑 座席表システム
- 6×7グリッド（42席、空席2席想定）
- リアルタイム座席選択
- 教卓カード（座席表最前列中央）

### 📝 トピック提出システム
- ポップアップ入力フォーム
- タイトル（必須）＋詳細内容（任意）
- 提出後の修正機能

### 💬 統合チャットシステム
- 座席表右側30%幅配置
- リアルタイム投稿・表示
- 教員・生徒区別表示

### 👨‍🏫 教員管理機能
- セッション作成・終了制御
- クラスコード表示・QRコード
- 参加者リアルタイム監視

## 🎨 画面構成

### メイン授業画面
- **座席表エリア（70%）**: 6×7グリッド + 教員カード
- **チャットエリア（30%）**: リアルタイムチャット

### 認証画面
- クラスコード入力
- 名前・出席番号入力
- バリデーション・エラーハンドリング

### 教員管理画面
- セッション設定フォーム
- セッション管理・監視
- データ出力機能

## 📊 データベース構造

### 主要テーブル
- `sessions`: 授業セッション管理
- `participants`: 座席・参加者管理
- `chat_messages`: チャットメッセージ
- `topic_reactions`: いいね・反応管理
- `topic_comments`: コメント管理

## 🌐 API エンドポイント

### 認証・セッション管理
- `POST /api/auth/create-session` - セッション作成
- `POST /api/auth/join-session` - セッション参加
- `POST /api/auth/close-session` - セッション終了

### 座席・トピック管理
- `POST /api/seats/select` - 座席選択
- `POST /api/topics/submit` - トピック提出

### チャット機能
- `POST /api/chat/send` - メッセージ送信
- `GET /api/chat/[sessionId]` - メッセージ取得

## 📱 レスポンシブ対応

### デスクトップ（1200px+）
- 座席表70% + チャット30%の並列表示
- マウスホバーで詳細表示

### タブレット（768-1199px）
- 座席表とチャットのタブ切り替え
- タッチ操作最適化

### スマートフォン（-767px）
- 縦スクロールレイアウト
- モバイルファースト設計

### Chromebook特別最適化
- PWAホーム画面追加
- ハイブリッド操作対応

## 🔧 開発方針

### Phase 1: 基盤構築（完了）
- ✅ Next.js + TypeScript + Tailwind CSS
- ✅ Supabaseデータベース設計
- ✅ 8桁クラスコード認証システム
- ✅ 基本座席表レイアウト
- ✅ トピック提出機能
- ✅ チャットシステム基盤
- ✅ 教員管理画面

### Phase 2: 機能強化（完了）
- ✅ Supabase Realtime統合
- ✅ トピック詳細表示（ホバー/タップ）
- ✅ いいね・コメント機能
- ✅ 教卓カード機能強化
- ✅ レスポンシブ最適化
- ✅ 座席選択・グループワーク支援
- ✅ リアルタイムチャット

### Phase 3: 教員支援機能（完了）
- ✅ 教員用リアルタイムダッシュボード
- ✅ チャット監視・管理機能
- ✅ クイック投票・お知らせシステム
- ✅ 参加分析・レポート機能
- ✅ メタブレイン知識ネットワーク可視化

### Phase 4: デプロイメント準備（完了）
- ✅ Next.js設定最適化
- ✅ パフォーマンスチューニング
- ✅ セキュリティ設定
- ✅ 本番環境設定ファイル作成

## 🚀 デプロイガイド

### 1. Supabase設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQLエディタで以下のテーブルを作成：

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

### 2. Vercelデプロイ

1. GitHubにプッシュ後、[Vercel](https://vercel.com)でインポート
2. 環境変数設定：
   - `NEXT_PUBLIC_SUPABASE_URL`: SupabaseのProject URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: SupabaseのAnon Key

3. デプロイ完了！PWAとして利用可能

### 3. セキュリティ設定

本番環境では以下を確認：
- HTTPS自動適用
- セキュリティヘッダー設定済み
- 入力値検証・XSS対策済み

## 🎯 利用開始

1. **教師**: セッション作成 → 8桁コード配布
2. **生徒**: コード入力 → 座席選択 → 授業参加
3. **授業**: トピック提出 → 相互評価 → ディスカッション

## 📄 ライセンス

MIT License - 教育現場での自由利用を推奨

## 🤝 貢献・サポート

教育関係者・開発者の皆様からのフィードバック歓迎！

---

**🏛️ 公共のキョウシツで、未来の民主主義教育を創造しよう！**
