import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 環境変数の検証
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('🚧 Supabase environment variables are not set. Running in demo mode.')
}

// デモモード判定（開発中は強制的にデモモード）
export const isDemo = true || !supabaseUrl || !supabaseAnonKey || 
  supabaseUrl === 'your-project-url' || 
  supabaseAnonKey === 'your-anon-key'

// Supabaseクライアントの作成（型付き）
export const supabase = createClient<Database>(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'demo-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

// デバッグ情報
if (typeof window !== 'undefined') {
  console.log('🔗 Supabase connection:', {
    url: supabaseUrl,
    isDemo,
    hasKey: !!supabaseAnonKey
  })
}

// データベースヘルパー関数
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('sessions').select('count').limit(1)
    return !error
  } catch (err) {
    console.error('Database connection test failed:', err)
    return false
  }
}

// セッション関連の操作
export const sessionAPI = {
  // セッション作成
  async create(sessionData: Database['public']['Tables']['sessions']['Insert']) {
    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // セッション取得（コード）
  async findByCode(sessionCode: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_code', sessionCode)
      .eq('status', 'active')
      .single()
    
    if (error) throw error
    return data
  },

  // セッション更新
  async update(id: string, updates: Database['public']['Tables']['sessions']['Update']) {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // セッション終了
  async close(id: string) {
    const { data, error } = await supabase
      .from('sessions')
      .update({ 
        status: 'closed',
        closed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// 参加者関連の操作
export const participantAPI = {
  // 参加者追加
  async join(participantData: Database['public']['Tables']['participants']['Insert']) {
    const { data, error } = await supabase
      .from('participants')
      .insert(participantData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // セッションの参加者一覧取得
  async getBySession(sessionId: string) {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at')
    
    if (error) throw error
    return data
  },

  // トピック提出・更新
  async updateTopic(id: string, topicData: { topic_title?: string; topic_content?: string }) {
    const { data, error } = await supabase
      .from('participants')
      .update({
        ...topicData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// チャット関連の操作
export const chatAPI = {
  // メッセージ送信
  async send(messageData: Database['public']['Tables']['chat_messages']['Insert']) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // セッションのメッセージ取得
  async getBySession(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .is('deleted_at', null)
      .order('created_at')
    
    if (error) throw error
    return data
  },

  // リアルタイム購読
  subscribeToMessages(sessionId: string, callback: (message: Database['public']['Tables']['chat_messages']['Row']) => void) {
    return supabase
      .channel(`chat:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          callback(payload.new as Database['public']['Tables']['chat_messages']['Row'])
        }
      )
      .subscribe()
  }
}

// リアクション関連の操作
export const reactionAPI = {
  // いいね追加
  async like(participantId: string, reactorName: string) {
    const { data, error } = await supabase
      .from('topic_reactions')
      .insert({
        participant_id: participantId,
        reactor_name: reactorName,
        reaction_type: 'like'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 参加者のリアクション統計取得
  async getStats(participantId: string) {
    const { data, error } = await supabase
      .from('topic_reactions')
      .select('reaction_type')
      .eq('participant_id', participantId)
    
    if (error) throw error
    
    const likes = data.filter(r => r.reaction_type === 'like').length
    const views = data.filter(r => r.reaction_type === 'view').length
    
    return { likes, views }
  }
}

// コメント関連の操作
export const commentAPI = {
  // コメント追加
  async add(commentData: Database['public']['Tables']['topic_comments']['Insert']) {
    const { data, error } = await supabase
      .from('topic_comments')
      .insert(commentData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 参加者のコメント取得
  async getByParticipant(participantId: string) {
    const { data, error } = await supabase
      .from('topic_comments')
      .select('*')
      .eq('participant_id', participantId)
      .order('created_at')
    
    if (error) throw error
    return data
  }
}