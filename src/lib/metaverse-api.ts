import { supabase, isDemo } from './supabase'

// メタバース教室用のAPI関数

export interface ViewingLog {
  id?: string
  user_name: string
  session_id: string
  viewed_at?: string
  duration_seconds?: number
  scroll_depth?: number
  viewing_context?: any
}

export interface LikeLog {
  id?: string
  user_name: string
  target_session_id: string
  target_participant_id?: string
  liked_at?: string
  topic_title?: string
  topic_content_summary?: string
  target_class?: string
  target_date?: string
}

export interface CommentLog {
  id?: string
  commenter_name: string
  target_session_id: string
  target_participant_id?: string
  comment_content: string
  commented_at?: string
  original_topic_title?: string
  comment_theme?: string
  target_class?: string
  target_date?: string
}

export interface SearchLog {
  id?: string
  user_name: string
  search_keywords: string
  search_filters?: any
  result_count?: number
  clicked_results?: any
  searched_at?: string
}

export interface RealtimePresence {
  id?: string
  user_name: string
  current_page?: string
  viewing_element?: string
  last_activity?: string
  is_active?: boolean
  session_data?: any
}

// 閲覧ログ記録
export const logViewing = async (log: ViewingLog): Promise<ViewingLog | null> => {
  if (isDemo) {
    // デモモードではLocalStorageに保存
    const logs = JSON.parse(localStorage.getItem('viewing_logs') || '[]')
    const newLog = {
      ...log,
      id: `view_${Date.now()}`,
      viewed_at: new Date().toISOString()
    }
    logs.push(newLog)
    localStorage.setItem('viewing_logs', JSON.stringify(logs))
    return newLog
  }

  try {
    const { data, error } = await supabase
      .from('viewing_logs')
      .insert({
        user_name: log.user_name,
        session_id: log.session_id,
        duration_seconds: log.duration_seconds || 0,
        scroll_depth: log.scroll_depth || 0,
        viewing_context: log.viewing_context || {}
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error logging viewing:', error)
    return null
  }
}

// いいね記録
export const logLike = async (log: LikeLog): Promise<LikeLog | null> => {
  if (isDemo) {
    const logs = JSON.parse(localStorage.getItem('like_logs') || '[]')
    const newLog = {
      ...log,
      id: `like_${Date.now()}`,
      liked_at: new Date().toISOString()
    }
    logs.push(newLog)
    localStorage.setItem('like_logs', JSON.stringify(logs))
    return newLog
  }

  try {
    const { data, error } = await supabase
      .from('like_logs')
      .insert({
        user_name: log.user_name,
        target_session_id: log.target_session_id,
        target_participant_id: log.target_participant_id,
        topic_title: log.topic_title,
        topic_content_summary: log.topic_content_summary,
        target_class: log.target_class,
        target_date: log.target_date
      })
      .select()
      .single()

    if (error) {
      // 重複いいねの場合は既存データを返す
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('like_logs')
          .select()
          .eq('user_name', log.user_name)
          .eq('target_participant_id', log.target_participant_id)
          .single()
        return existing
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Error logging like:', error)
    return null
  }
}

// コメント記録
export const logComment = async (log: CommentLog): Promise<CommentLog | null> => {
  if (isDemo) {
    const logs = JSON.parse(localStorage.getItem('comment_logs') || '[]')
    const newLog = {
      ...log,
      id: `comment_${Date.now()}`,
      commented_at: new Date().toISOString()
    }
    logs.push(newLog)
    localStorage.setItem('comment_logs', JSON.stringify(logs))
    return newLog
  }

  try {
    const { data, error } = await supabase
      .from('comment_logs')
      .insert({
        commenter_name: log.commenter_name,
        target_session_id: log.target_session_id,
        target_participant_id: log.target_participant_id,
        comment_content: log.comment_content,
        original_topic_title: log.original_topic_title,
        comment_theme: log.comment_theme,
        target_class: log.target_class,
        target_date: log.target_date
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error logging comment:', error)
    return null
  }
}

// 検索ログ記録
export const logSearch = async (log: SearchLog): Promise<SearchLog | null> => {
  if (isDemo) {
    const logs = JSON.parse(localStorage.getItem('search_logs') || '[]')
    const newLog = {
      ...log,
      id: `search_${Date.now()}`,
      searched_at: new Date().toISOString()
    }
    logs.push(newLog)
    localStorage.setItem('search_logs', JSON.stringify(logs))
    return newLog
  }

  try {
    const { data, error } = await supabase
      .from('search_logs')
      .insert({
        user_name: log.user_name,
        search_keywords: log.search_keywords,
        search_filters: log.search_filters || {},
        result_count: log.result_count || 0,
        clicked_results: log.clicked_results || {}
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error logging search:', error)
    return null
  }
}

// リアルタイムプレゼンス更新
export const updatePresence = async (presence: RealtimePresence): Promise<RealtimePresence | null> => {
  if (isDemo) {
    const presences = JSON.parse(localStorage.getItem('realtime_presence') || '[]')
    const existingIndex = presences.findIndex((p: any) => p.user_name === presence.user_name)
    
    const newPresence = {
      ...presence,
      id: `presence_${Date.now()}`,
      last_activity: new Date().toISOString(),
      is_active: true
    }

    if (existingIndex >= 0) {
      presences[existingIndex] = newPresence
    } else {
      presences.push(newPresence)
    }
    
    localStorage.setItem('realtime_presence', JSON.stringify(presences))
    return newPresence
  }

  try {
    const { data, error } = await supabase
      .from('realtime_presence')
      .upsert({
        user_name: presence.user_name,
        current_page: presence.current_page || '/metaverse',
        viewing_element: presence.viewing_element,
        last_activity: new Date().toISOString(),
        is_active: true,
        session_data: presence.session_data || {}
      }, {
        onConflict: 'user_name'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating presence:', error)
    return null
  }
}

// アクティブなプレゼンス取得
export const getActivePresences = async (): Promise<RealtimePresence[]> => {
  if (isDemo) {
    const presences = JSON.parse(localStorage.getItem('realtime_presence') || '[]')
    return presences.filter((p: any) => p.is_active)
  }

  try {
    const { data, error } = await supabase
      .from('realtime_presence')
      .select('*')
      .eq('is_active', true)
      .gte('last_activity', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5分以内
      .order('last_activity', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting presences:', error)
    return []
  }
}

// プレゼンス非アクティブ化
export const deactivatePresence = async (userName: string): Promise<void> => {
  if (isDemo) {
    const presences = JSON.parse(localStorage.getItem('realtime_presence') || '[]')
    const updated = presences.map((p: any) => 
      p.user_name === userName ? { ...p, is_active: false } : p
    )
    localStorage.setItem('realtime_presence', JSON.stringify(updated))
    return
  }

  try {
    await supabase
      .from('realtime_presence')
      .update({ is_active: false })
      .eq('user_name', userName)
  } catch (error) {
    console.error('Error deactivating presence:', error)
  }
}

// 個人の学習統計取得
export const getPersonalStats = async (userName: string) => {
  if (isDemo) {
    const viewingLogs = JSON.parse(localStorage.getItem('viewing_logs') || '[]')
    const likeLogs = JSON.parse(localStorage.getItem('like_logs') || '[]')
    const commentLogs = JSON.parse(localStorage.getItem('comment_logs') || '[]')
    const searchLogs = JSON.parse(localStorage.getItem('search_logs') || '[]')

    return {
      viewingCount: viewingLogs.filter((l: any) => l.user_name === userName).length,
      likeCount: likeLogs.filter((l: any) => l.user_name === userName).length,
      commentCount: commentLogs.filter((l: any) => l.commenter_name === userName).length,
      searchCount: searchLogs.filter((l: any) => l.user_name === userName).length
    }
  }

  try {
    const [viewingResult, likeResult, commentResult, searchResult] = await Promise.all([
      supabase.from('viewing_logs').select('id', { count: 'exact' }).eq('user_name', userName),
      supabase.from('like_logs').select('id', { count: 'exact' }).eq('user_name', userName),
      supabase.from('comment_logs').select('id', { count: 'exact' }).eq('commenter_name', userName),
      supabase.from('search_logs').select('id', { count: 'exact' }).eq('user_name', userName)
    ])

    return {
      viewingCount: viewingResult.count || 0,
      likeCount: likeResult.count || 0,
      commentCount: commentResult.count || 0,
      searchCount: searchResult.count || 0
    }
  } catch (error) {
    console.error('Error getting personal stats:', error)
    return {
      viewingCount: 0,
      likeCount: 0,
      commentCount: 0,
      searchCount: 0
    }
  }
}