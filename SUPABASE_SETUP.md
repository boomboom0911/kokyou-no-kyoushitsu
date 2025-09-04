# 🗄️ Supabase セットアップ手順（並行作業）

GitHub作業と**並行して**進められます。

## 1. Supabaseプロジェクト作成

1. **新しいタブで** [Supabase.com](https://supabase.com) を開く
2. 「Start your project」をクリック
3. GitHub/Google でサインアップ
4. 「New Project」をクリック

## 2. プロジェクト設定

```
Project Name: kokyou-no-kyoushitsu
Database Password: [強いパスワードを設定] ⚠️ 必ずメモ！
Region: Asia Pacific (Tokyo) - ap-northeast-1
Pricing Plan: Free ($0/month)
```

5. 「Create new project」をクリック
6. **3-5分待機**（データベース準備中）

## 3. データベース作成

プロジェクト準備完了後：

1. 左サイドバー「SQL Editor」をクリック
2. 「New query」をクリック
3. 以下のSQLをコピー&ペースト：

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

4. 「RUN」ボタンをクリック
5. ✅ 成功メッセージ確認

## 4. 接続情報取得

1. 左サイドバー「Settings」→「API」
2. 以下をコピーしてメモ：

```
Project URL: https://[プロジェクトID].supabase.co
anon public key: eyJ[長いキー]...
```

⚠️ **重要**: これらの値はVercel設定で使用するため必ずメモしてください！

## 5. 完了確認

- 左サイドバー「Table Editor」でテーブル作成確認
- 5つのテーブル（sessions, participants, chat_messages, topic_reactions, topic_comments）が表示されていればOK