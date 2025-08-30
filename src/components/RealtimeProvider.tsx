'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isDemo } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

interface RealtimeContextType {
  isConnected: boolean
  participants: Database['public']['Tables']['participants']['Row'][]
  chatMessages: Database['public']['Tables']['chat_messages']['Row'][]
  subscribeToSession: (sessionId: string) => void
  unsubscribeFromSession: () => void
  sendChatMessage: (sessionId: string, senderName: string, message: string, isTeacher?: boolean) => void
}

const RealtimeContext = createContext<RealtimeContextType | null>(null)

export const useRealtime = () => {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

interface RealtimeProviderProps {
  children: React.ReactNode
}

export default function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState<Database['public']['Tables']['participants']['Row'][]>([])
  const [chatMessages, setChatMessages] = useState<Database['public']['Tables']['chat_messages']['Row'][]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])

  // リアルタイム接続状態の監視
  useEffect(() => {
    if (isDemo) {
      setIsConnected(true)
      return
    }

    const checkConnection = () => {
      const status = supabase.channel('heartbeat').subscribe()
      setIsConnected(status === 'SUBSCRIBED')
    }

    checkConnection()
    const interval = setInterval(checkConnection, 5000)

    return () => clearInterval(interval)
  }, [])

  // セッションへの購読
  const subscribeToSession = async (sessionId: string) => {
    if (!sessionId) return
    
    // 既存の購読を解除
    unsubscribeFromSession()
    
    setCurrentSessionId(sessionId)

    if (isDemo) {
      console.log('Demo mode: Realtime simulation for session:', sessionId)
      return
    }

    try {
      // 参加者の変更を購読
      const participantsSub = supabase
        .channel(`participants:${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'participants',
            filter: `session_id=eq.${sessionId}`
          },
          async (payload) => {
            console.log('Participants change:', payload)
            // 参加者データを再取得
            const response = await fetch(`/api/participants?sessionId=${sessionId}`)
            if (response.ok) {
              const result = await response.json()
              if (result.success) {
                setParticipants(result.data)
              }
            }
          }
        )
        .subscribe()

      // チャットメッセージを購読
      const chatSub = supabase
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
            console.log('New chat message:', payload)
            const newMessage = payload.new as Database['public']['Tables']['chat_messages']['Row']
            setChatMessages(prev => [...prev, newMessage])
          }
        )
        .subscribe()

      // リアクションの変更を購読
      const reactionsSub = supabase
        .channel(`reactions:${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'topic_reactions'
          },
          async () => {
            console.log('Reactions change')
            // 参加者データを再取得（いいね数更新のため）
            const response = await fetch(`/api/participants?sessionId=${sessionId}`)
            if (response.ok) {
              const result = await response.json()
              if (result.success) {
                setParticipants(result.data)
              }
            }
          }
        )
        .subscribe()

      setSubscriptions([participantsSub, chatSub, reactionsSub])

      // 初期データの読み込み
      await loadInitialData(sessionId)

    } catch (error) {
      console.error('Realtime subscription error:', error)
    }
  }

  // 初期データの読み込み
  const loadInitialData = async (sessionId: string) => {
    try {
      // 参加者データ
      const participantsResponse = await fetch(`/api/participants?sessionId=${sessionId}`)
      if (participantsResponse.ok) {
        const result = await participantsResponse.json()
        if (result.success) {
          setParticipants(result.data)
        }
      }

      // チャットメッセージ
      const chatResponse = await fetch(`/api/chat?sessionId=${sessionId}`)
      if (chatResponse.ok) {
        const result = await chatResponse.json()
        if (result.success) {
          setChatMessages(result.data)
        }
      }
    } catch (error) {
      console.error('Initial data loading error:', error)
    }
  }

  // 購読解除
  const unsubscribeFromSession = () => {
    subscriptions.forEach(sub => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe()
      }
    })
    setSubscriptions([])
    setCurrentSessionId(null)
    setParticipants([])
    setChatMessages([])
  }

  // チャットメッセージ送信
  const sendChatMessage = async (sessionId: string, senderName: string, message: string, isTeacher = false) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          senderName,
          message,
          isTeacher
        })
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error)
      }

      // デモモードの場合は手動でメッセージを追加
      if (isDemo) {
        setChatMessages(prev => [...prev, result.data])
      }

      return result.data
    } catch (error) {
      console.error('Chat message send error:', error)
      throw error
    }
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      unsubscribeFromSession()
    }
  }, [])

  const value: RealtimeContextType = {
    isConnected,
    participants,
    chatMessages,
    subscribeToSession,
    unsubscribeFromSession,
    sendChatMessage
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}