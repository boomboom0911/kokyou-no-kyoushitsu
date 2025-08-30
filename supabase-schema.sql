-- 公共のキョウシツ PostgreSQL データベース設計
-- 仕様書に基づく完全なテーブル構造

-- 🏫 授業セッション管理
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_code CHAR(8) UNIQUE NOT NULL,
    class_name VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    period INTEGER NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    teacher_topic_title VARCHAR(100),
    teacher_topic_content TEXT,
    created_at TIMESTAMP DEFAULT now(),
    closed_at TIMESTAMP,
    
    -- セッション一意性制約
    UNIQUE(class_name, date, period)
);

-- 👨‍🎓 座席・参加者管理
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    student_name VARCHAR(50) NOT NULL,
    student_id VARCHAR(20),
    seat_position INTEGER NOT NULL CHECK(seat_position BETWEEN 1 AND 42),
    topic_title VARCHAR(100),
    topic_content TEXT,
    joined_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    -- 座席重複防止
    UNIQUE(session_id, seat_position),
    -- 同一セッション内での名前重複防止  
    UNIQUE(session_id, student_name)
);

-- 💬 チャットメッセージ
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    sender_name VARCHAR(50) NOT NULL,
    message TEXT NOT NULL CHECK(length(message) <= 200),
    is_teacher BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- 👍 いいね・反応管理  
CREATE TABLE topic_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    reactor_name VARCHAR(50) NOT NULL,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'view')),
    created_at TIMESTAMP DEFAULT now(),
    
    -- 重複反応防止
    UNIQUE(participant_id, reactor_name, reaction_type)
);

-- 💭 コメント管理
CREATE TABLE topic_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    commenter_name VARCHAR(50) NOT NULL,
    content TEXT NOT NULL CHECK(length(content) <= 300),
    created_at TIMESTAMP DEFAULT now()
);

-- 📈 インデックス設計（パフォーマンス最適化）
CREATE INDEX idx_sessions_active ON sessions(status, date, class_name);
CREATE INDEX idx_participants_session ON participants(session_id);
CREATE INDEX idx_chat_messages_session_time ON chat_messages(session_id, created_at);
CREATE INDEX idx_reactions_participant ON topic_reactions(participant_id);
CREATE INDEX idx_comments_participant_time ON topic_comments(participant_id, created_at);

-- 🔐 Row Level Security (RLS) ポリシー設定
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_comments ENABLE ROW LEVEL SECURITY;

-- セッション参加者のみアクセス可能
CREATE POLICY "Sessions are viewable by everyone" ON sessions FOR SELECT USING (true);
CREATE POLICY "Participants can view session data" ON participants FOR SELECT USING (true);
CREATE POLICY "Chat messages are viewable by everyone" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Reactions are viewable by everyone" ON topic_reactions FOR SELECT USING (true);
CREATE POLICY "Comments are viewable by everyone" ON topic_comments FOR SELECT USING (true);

-- 挿入・更新ポリシー（より厳密な制御は後で実装）
CREATE POLICY "Anyone can insert sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert participants" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert chat messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert reactions" ON topic_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert comments" ON topic_comments FOR INSERT WITH CHECK (true);

-- リアルタイム機能の有効化
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE topic_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE topic_comments;