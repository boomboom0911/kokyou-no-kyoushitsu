-- メタバース教室用のデータベース拡張
-- 個人振り返り機能のための行動ログ記録

-- 👀 閲覧ログテーブル（どの授業を見たか）
CREATE TABLE viewing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(50) NOT NULL,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT now(),
    duration_seconds INTEGER DEFAULT 0,
    scroll_depth FLOAT DEFAULT 0.0,
    viewing_context JSONB, -- 検索経由、月別フィルター等
    
    -- インデックス
    INDEX idx_viewing_logs_user (user_name),
    INDEX idx_viewing_logs_session (session_id),
    INDEX idx_viewing_logs_date (viewed_at)
);

-- 👍 いいね記録テーブル（個人振り返り用データ保存）
CREATE TABLE like_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(50) NOT NULL,
    target_session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    target_participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    liked_at TIMESTAMP DEFAULT now(),
    
    -- 個人振り返り用のスナップショット
    topic_title VARCHAR(100),
    topic_content_summary TEXT,
    target_class VARCHAR(10),
    target_date DATE,
    
    -- 重複いいね防止
    UNIQUE(user_name, target_participant_id),
    
    -- インデックス
    INDEX idx_like_logs_user (user_name),
    INDEX idx_like_logs_target (target_participant_id)
);

-- 💬 コメントログテーブル
CREATE TABLE comment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commenter_name VARCHAR(50) NOT NULL,
    target_session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    target_participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    comment_content TEXT NOT NULL CHECK(length(comment_content) <= 300),
    commented_at TIMESTAMP DEFAULT now(),
    
    -- 関連情報（個人振り返り用）
    original_topic_title VARCHAR(100),
    comment_theme VARCHAR(50), -- 自動分類用（将来の拡張）
    target_class VARCHAR(10),
    target_date DATE,
    
    -- インデックス
    INDEX idx_comment_logs_commenter (commenter_name),
    INDEX idx_comment_logs_target (target_participant_id)
);

-- 🔍 検索行動ログテーブル
CREATE TABLE search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(50) NOT NULL,
    search_keywords TEXT NOT NULL,
    search_filters JSONB, -- {"month": "2024-08", "class": "1組"}
    result_count INTEGER DEFAULT 0,
    clicked_results JSONB, -- クリックした結果の記録
    searched_at TIMESTAMP DEFAULT now(),
    
    -- インデックス
    INDEX idx_search_logs_user (user_name),
    INDEX idx_search_logs_keywords (search_keywords),
    INDEX idx_search_logs_date (searched_at)
);

-- 🗺️ リアルタイム閲覧状況（忍びの地図用）
CREATE TABLE realtime_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(50) NOT NULL,
    current_page VARCHAR(100) DEFAULT '/metaverse',
    viewing_element VARCHAR(100), -- 現在見ている授業
    last_activity TIMESTAMP DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    session_data JSONB, -- ブラウザセッション情報
    
    -- 重複防止（ユーザーは1つのプレゼンスのみ）
    UNIQUE(user_name),
    
    -- インデックス
    INDEX idx_realtime_presence_active (is_active, last_activity)
);

-- 📊 個人学習ネットワーク統合ビュー（個人振り返り用）
CREATE VIEW personal_learning_network AS
SELECT 
    p.student_name,
    p.session_id,
    s.date,
    s.class_name,
    s.teacher_topic_title,
    p.topic_title as own_topic,
    p.topic_content as own_content,
    
    -- いいねした他者のトピック
    (SELECT json_agg(
        json_build_object(
            'topic', ll.topic_title,
            'class', ll.target_class,
            'date', ll.target_date,
            'liked_at', ll.liked_at
        ) ORDER BY ll.liked_at DESC
    ) FROM like_logs ll WHERE ll.user_name = p.student_name) as liked_topics,
    
    -- コメントした他者のトピック  
    (SELECT json_agg(
        json_build_object(
            'topic', cl.original_topic_title,
            'comment', cl.comment_content,
            'class', cl.target_class,
            'date', cl.target_date,
            'commented_at', cl.commented_at
        ) ORDER BY cl.commented_at DESC
    ) FROM comment_logs cl WHERE cl.commenter_name = p.student_name) as commented_topics,
    
    -- 閲覧した授業の記録
    (SELECT json_agg(
        json_build_object(
            'session_id', vl.session_id,
            'viewed_at', vl.viewed_at,
            'duration', vl.duration_seconds,
            'context', vl.viewing_context
        ) ORDER BY vl.viewed_at DESC
    ) FROM viewing_logs vl WHERE vl.user_name = p.student_name) as viewing_history,
    
    -- 検索行動の記録
    (SELECT json_agg(
        json_build_object(
            'keywords', sl.search_keywords,
            'filters', sl.search_filters,
            'searched_at', sl.searched_at
        ) ORDER BY sl.searched_at DESC
    ) FROM search_logs sl WHERE sl.user_name = p.student_name) as search_history

FROM participants p
JOIN sessions s ON p.session_id = s.id
WHERE p.student_name IS NOT NULL;

-- RLS（Row Level Security）ポリシー設定
ALTER TABLE viewing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE like_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_presence ENABLE ROW LEVEL SECURITY;

-- 基本的なRLSポリシー（全員が読み書き可能）
CREATE POLICY "Anyone can view logs" ON viewing_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert logs" ON viewing_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view likes" ON like_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert likes" ON like_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view comments" ON comment_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON comment_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view searches" ON search_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert searches" ON search_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view presence" ON realtime_presence FOR SELECT USING (true);
CREATE POLICY "Anyone can manage presence" ON realtime_presence FOR ALL USING (true);

-- リアルタイム機能の有効化
ALTER PUBLICATION supabase_realtime ADD TABLE viewing_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE like_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE comment_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE search_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE realtime_presence;