import { supabase, isDemo } from './supabase'

// メタブレイン用のデータ型定義

export interface MetabrainNode {
  id: string
  label: string
  title: string // ホバー時表示
  type: 'own' | 'commented' | 'liked' | 'viewed'
  color: string
  size: number
  content: string
  sessionId?: string
  className?: string
  date?: string
}

export interface MetabrainEdge {
  id: string
  from: string
  to: string
  type: 'auto' | 'manual'
  width: number
  color: string
  strength: number
  label?: string
  // 動的太さ計算用データ
  viewingFrequency?: number     // 閲覧回数
  manualConnections?: number    // 手動接続回数
  pathFrequency?: number        // 経路使用頻度
  lastAccessTime?: string       // 最終アクセス時間
  interactionCount?: number     // 総インタラクション数
}

export interface PersonalLearningData {
  student_name: string
  session_id: string
  date: string
  class_name: string
  teacher_topic_title: string
  own_topic: string
  own_content: string
  liked_topics?: any[]
  commented_topics?: any[]
  viewing_history?: any[]
  search_history?: any[]
}

export interface MetabrainVisualizationData {
  nodes: MetabrainNode[]
  edges: MetabrainEdge[]
  stats: {
    totalNodes: number
    totalConnections: number
    ownTopics: number
    likedTopics: number
    commentedTopics: number
    viewedSessions: number
  }
}

// 線の太さ計算ロジック
export const calculateEdgeWidth = (edge: MetabrainEdge): number => {
  const baseWidth = 1
  const viewCount = edge.viewingFrequency || 0
  const manualCount = edge.manualConnections || 0
  const pathFrequency = edge.pathFrequency || 0
  const interactionBonus = Math.min(2, (edge.interactionCount || 0) * 0.1)
  
  // 最終アクセス時間による減衰効果（新しいほど太い）
  let timeBonus = 0
  if (edge.lastAccessTime) {
    const daysSinceAccess = (Date.now() - new Date(edge.lastAccessTime).getTime()) / (1000 * 60 * 60 * 24)
    timeBonus = Math.max(0, 1 - daysSinceAccess * 0.1) // 10日で完全減衰
  }
  
  const calculatedWidth = baseWidth + 
    viewCount * 0.5 +           // 閲覧頻度の影響
    manualCount * 1.5 +         // 手動接続の強い影響
    pathFrequency * 0.3 +       // 経路使用の影響
    interactionBonus +          // インタラクション回数のボーナス
    timeBonus                   // 時間的新鮮さボーナス
  
  // 1-8の範囲に制限（より太い線まで表現）
  return Math.max(1, Math.min(8, calculatedWidth))
}

// 線の色を強度によって動的に変化させる
export const calculateEdgeColor = (edge: MetabrainEdge): string => {
  const strength = edge.strength || 1
  const normalizedStrength = Math.min(1, strength / 5) // 0-1に正規化
  
  // 強度によって青→紫→金色に変化
  if (normalizedStrength < 0.3) {
    return `rgba(100, 181, 246, ${0.6 + normalizedStrength * 0.4})` // 青系
  } else if (normalizedStrength < 0.7) {
    return `rgba(156, 39, 176, ${0.7 + normalizedStrength * 0.3})` // 紫系
  } else {
    return `rgba(255, 215, 0, ${0.8 + normalizedStrength * 0.2})` // 金系
  }
}

// アニメーション効果のための線スタイル計算
export const calculateEdgeAnimation = (edge: MetabrainEdge): any => {
  const strength = edge.strength || 1
  
  if (strength >= 4) {
    // 高強度：脈動エフェクト
    return {
      dashes: false,
      shadow: {
        enabled: true,
        color: edge.color,
        size: 10,
        x: 0,
        y: 0
      }
    }
  } else if (strength >= 2) {
    // 中強度：点線エフェクト
    return {
      dashes: [5, 5],
      shadow: {
        enabled: true,
        color: edge.color,
        size: 5,
        x: 0,
        y: 0
      }
    }
  } else {
    // 低強度：標準
    return {
      dashes: false,
      shadow: {
        enabled: false
      }
    }
  }
}

// 個人学習ネットワークデータを取得
export const getPersonalLearningNetwork = async (
  userName: string,
  options?: {
    year?: number
    semester?: number
    startDate?: string
    endDate?: string
  }
): Promise<PersonalLearningData[]> => {
  // メタブレインのデモデータを常に表示（開発中）
  if (true) { // 一時的にデモモードを強制
    // デモ用のサンプルデータ
    return [
      {
        student_name: userName,
        session_id: 'demo-session-1',
        date: '2024-08-20',
        class_name: '1組',
        teacher_topic_title: '民主主義と政治参加',
        own_topic: '若者の政治離れの原因',
        own_content: '若者が政治に関心を持たない理由を考え、解決策を提案したい。',
        liked_topics: [
          {
            topic: '選挙制度の改革案',
            class: '2組',
            date: '2024-08-18',
            liked_at: '2024-08-20T10:30:00Z'
          },
          {
            topic: 'SNSと政治の関係',
            class: '3組', 
            date: '2024-08-19',
            liked_at: '2024-08-20T11:15:00Z'
          }
        ],
        commented_topics: [
          {
            topic: '地方自治の重要性',
            comment: '身近な政治から始めることが大切だと思います',
            class: '1組',
            date: '2024-08-15',
            commented_at: '2024-08-20T09:45:00Z'
          }
        ],
        viewing_history: [
          {
            session_id: 'session-2',
            viewed_at: '2024-08-19T14:20:00Z',
            duration: 180,
            context: { from: 'metaverse_search', keyword: '民主主義' }
          }
        ]
      }
    ]
  }

  try {
    let query = supabase
      .from('personal_learning_network')
      .select('*')
      .eq('student_name', userName)

    // 日付フィルターの適用
    if (options?.startDate) {
      query = query.gte('date', options.startDate)
    }
    if (options?.endDate) {
      query = query.lte('date', options.endDate)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []

  } catch (error) {
    console.error('Error fetching personal learning network:', error)
    return []
  }
}

// メタブレイン可視化用のデータに変換
export const transformToVisualizationData = (
  learningData: PersonalLearningData[]
): MetabrainVisualizationData => {
  const nodes: MetabrainNode[] = []
  const edges: MetabrainEdge[] = []
  let nodeIdCounter = 1

  // 統計情報の初期化
  const stats = {
    totalNodes: 0,
    totalConnections: 0,
    ownTopics: 0,
    likedTopics: 0,
    commentedTopics: 0,
    viewedSessions: 0
  }

  learningData.forEach((data, index) => {
    // 自分のトピックノード（中心となる恒星）
    if (data.own_topic) {
      const ownNodeId = `own-${nodeIdCounter++}`
      nodes.push({
        id: ownNodeId,
        label: data.own_topic.length > 20 ? 
          data.own_topic.substring(0, 20) + '...' : 
          data.own_topic,
        title: `【${data.class_name} ${data.date}】\n${data.own_topic}\n\n${data.own_content}`,
        type: 'own',
        color: '#ffd700', // 黄金色
        size: 25,
        content: data.own_content,
        sessionId: data.session_id,
        className: data.class_name,
        date: data.date
      })
      stats.ownTopics++
    }

    // いいねしたトピック（青い星）
    if (data.liked_topics) {
      data.liked_topics.forEach((liked: any) => {
        if (liked.topic) {
          const likedNodeId = `liked-${nodeIdCounter++}`
          nodes.push({
            id: likedNodeId,
            label: liked.topic.length > 15 ? 
              liked.topic.substring(0, 15) + '...' : 
              liked.topic,
            title: `【いいね】${liked.class} ${liked.date}\n${liked.topic}`,
            type: 'liked',
            color: '#64b5f6', // 青白い色
            size: 15,
            content: liked.topic,
            className: liked.class,
            date: liked.date
          })
          stats.likedTopics++

          // 自分のトピックとの関連線（動的計算）
          const ownNode = nodes.find(n => n.type === 'own' && n.sessionId === data.session_id)
          if (ownNode) {
            // いいね行動の強度を計算
            const likeStrength = 2 + Math.random() * 3 // 2-5のランダム強度
            const viewingFreq = Math.floor(Math.random() * 5) + 1
            const interactionCount = Math.floor(Math.random() * 10) + 1
            
            const edge: MetabrainEdge = {
              id: `edge-${ownNode.id}-${likedNodeId}`,
              from: ownNode.id,
              to: likedNodeId,
              type: 'auto',
              width: 0, // 後で動的計算
              color: '#64b5f6',
              strength: likeStrength,
              viewingFrequency: viewingFreq,
              manualConnections: 0,
              pathFrequency: Math.random() * 2,
              lastAccessTime: liked.liked_at,
              interactionCount: interactionCount
            }
            
            // 動的に太さと色を計算
            edge.width = calculateEdgeWidth(edge)
            edge.color = calculateEdgeColor(edge)
            
            edges.push(edge)
          }
        }
      })
    }

    // コメントしたトピック（紫の星）
    if (data.commented_topics) {
      data.commented_topics.forEach((commented: any) => {
        if (commented.topic) {
          const commentedNodeId = `commented-${nodeIdCounter++}`
          nodes.push({
            id: commentedNodeId,
            label: commented.topic.length > 15 ? 
              commented.topic.substring(0, 15) + '...' : 
              commented.topic,
            title: `【コメント】${commented.class} ${commented.date}\n${commented.topic}\n\n💬 ${commented.comment}`,
            type: 'commented',
            color: '#9c27b0', // 紫色
            size: 18,
            content: commented.topic,
            className: commented.class,
            date: commented.date
          })
          stats.commentedTopics++

          // 自分のトピックとの関連線（コメントは強いつながり）
          const ownNode = nodes.find(n => n.type === 'own' && n.sessionId === data.session_id)
          if (ownNode) {
            // コメント行動の強度を計算（いいねより強い）
            const commentStrength = 3 + Math.random() * 4 // 3-7のランダム強度
            const viewingFreq = Math.floor(Math.random() * 8) + 2 // より高い閲覧頻度
            const interactionCount = Math.floor(Math.random() * 15) + 5 // より多いインタラクション
            
            const edge: MetabrainEdge = {
              id: `edge-${ownNode.id}-${commentedNodeId}`,
              from: ownNode.id,
              to: commentedNodeId,
              type: 'auto',
              width: 0, // 後で動的計算
              color: '#9c27b0',
              strength: commentStrength,
              label: '💬',
              viewingFrequency: viewingFreq,
              manualConnections: 1, // コメントは手動的要素が強い
              pathFrequency: Math.random() * 3 + 1,
              lastAccessTime: commented.commented_at,
              interactionCount: interactionCount
            }
            
            // 動的に太さと色を計算
            edge.width = calculateEdgeWidth(edge)
            edge.color = calculateEdgeColor(edge)
            
            edges.push(edge)
          }
        }
      })
    }
  })

  stats.totalNodes = nodes.length
  stats.totalConnections = edges.length

  return {
    nodes,
    edges,
    stats
  }
}

// 新しいトピックカードを追加
export const addNewTopicCard = async (
  userName: string,
  topicTitle: string,
  topicContent: string,
  sessionId?: string
): Promise<boolean> => {
  if (true) { // 一時的にデモモードを強制
    // デモ用：LocalStorageに保存
    const existingCards = JSON.parse(localStorage.getItem('user_topic_cards') || '[]')
    const newCard = {
      id: `user-card-${Date.now()}`,
      student_name: userName,
      topic_title: topicTitle,
      topic_content: topicContent,
      created_at: new Date().toISOString(),
      session_id: sessionId || 'user-created'
    }
    existingCards.push(newCard)
    localStorage.setItem('user_topic_cards', JSON.stringify(existingCards))
    return true
  }

  try {
    // 実際のセッションがない場合は、ユーザー作成専用のセッションを作る
    let targetSessionId = sessionId
    if (!targetSessionId) {
      // ユーザー専用セッション作成のロジックをここに追加
      // 今回はデモとしてダミーIDを使用
      targetSessionId = `user-${userName}-${Date.now()}`
    }

    const { data, error } = await supabase
      .from('participants')
      .insert({
        session_id: targetSessionId,
        student_name: userName,
        topic_title: topicTitle,
        topic_content: topicContent
      })
      .select()

    if (error) throw error
    return true

  } catch (error) {
    console.error('Error adding new topic card:', error)
    return false
  }
}