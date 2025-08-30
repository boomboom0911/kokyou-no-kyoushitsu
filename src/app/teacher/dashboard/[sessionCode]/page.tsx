'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase, isDemo } from '@/lib/supabase'
import TeacherChatModeration from '@/components/TeacherChatModeration'
import TeacherQuickTools from '@/components/TeacherQuickTools'
import ParticipationAnalytics from '@/components/ParticipationAnalytics'

interface Student {
  id: string
  student_name: string
  student_id?: string
  seat_position?: string
  topic_title?: string
  topic_content?: string
  status: 'joined' | 'seated' | 'submitted' | 'active'
  joined_at: string
  updated_at: string
}

interface ChatMessage {
  id: string
  session_id: string
  sender_name: string
  message: string
  created_at: string
  flagged?: boolean
  flag_reason?: string
  moderated?: boolean
  moderated_by?: string
  moderated_at?: string
}

interface SessionStats {
  totalStudents: number
  seatedStudents: number
  submittedTopics: number
  activeDiscussion: number
  totalMessages: number
}

export default function TeacherDashboard() {
  const params = useParams()
  const sessionCode = typeof params?.sessionCode === 'string' ? params.sessionCode : Array.isArray(params?.sessionCode) ? params.sessionCode[0] : ''
  
  const [students, setStudents] = useState<Student[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [stats, setStats] = useState<SessionStats>({
    totalStudents: 0,
    seatedStudents: 0,
    submittedTopics: 0,
    activeDiscussion: 0,
    totalMessages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [chatFilter, setChatFilter] = useState<'all' | 'recent' | 'flagged'>('recent')

  // リアルタイムデータ取得
  useEffect(() => {
    if (!sessionCode) return

    const fetchInitialData = async () => {
      try {
        if (isDemo) {
          // デモモードの場合
          const response = await fetch(`/api/demo/session/${sessionCode}`)
          if (!response.ok) {
            console.error('Demo session not found')
            setIsLoading(false)
            return
          }
          
          const { session, participants, messages: demoMessages } = await response.json()
          
          // 参加者データを変換
          const transformedStudents: Student[] = Object.values(participants).map((participant: any) => ({
            id: `demo-${participant.student_name}`,
            student_name: participant.student_name,
            student_id: participant.student_id,
            seat_position: participant.seat_position,
            topic_title: participant.topic_title,
            topic_content: participant.topic_content,
            status: getStudentStatus(participant),
            joined_at: participant.joined_at,
            updated_at: participant.updated_at || participant.joined_at
          }))

          setStudents(transformedStudents)
          setMessages(demoMessages || [])
          updateStats(transformedStudents, demoMessages || [])
        } else {
          // 実際のデータベース処理
          // セッションIDを取得
          const { data: sessionData } = await supabase
            .from('sessions')
            .select('id')
            .eq('session_code', sessionCode.toUpperCase())
            .single()

          if (!sessionData) {
            console.error('Session not found')
            return
          }

          const sessionId = sessionData.id

          // 学生データ取得
          const { data: studentsData } = await supabase
            .from('participants')
            .select('*')
            .eq('session_id', sessionId)
            .order('joined_at')

          // チャットメッセージ取得（直近50件）
          const { data: messagesData } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .limit(50)

          if (studentsData) {
            const transformedStudents: Student[] = studentsData.map(student => ({
              id: student.id,
              student_name: student.student_name,
              student_id: student.student_id,
              seat_position: student.seat_position,
              topic_title: student.topic_title,
              topic_content: student.topic_content,
              status: getStudentStatus(student),
              joined_at: student.joined_at,
              updated_at: student.updated_at
            }))
            
            setStudents(transformedStudents)
            updateStats(transformedStudents, messagesData || [])
          }

          if (messagesData) {
            setMessages(messagesData.reverse())
          }

          // リアルタイム監視の開始
          setupRealtimeSubscriptions(sessionId)
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [sessionCode])

  // 学生のステータス判定
  const getStudentStatus = (student: any): Student['status'] => {
    if (student.topic_title && student.topic_content) return 'submitted'
    if (student.seat_position) return 'seated' 
    return 'joined'
  }

  // 統計情報更新
  const updateStats = (studentsData: Student[], messagesData: ChatMessage[]) => {
    const newStats: SessionStats = {
      totalStudents: studentsData.length,
      seatedStudents: studentsData.filter(s => s.seat_position).length,
      submittedTopics: studentsData.filter(s => s.topic_title && s.topic_content).length,
      activeDiscussion: studentsData.filter(s => s.status === 'active').length,
      totalMessages: messagesData.length
    }
    setStats(newStats)
  }

  // リアルタイム監視設定
  const setupRealtimeSubscriptions = (sessionId: string) => {
    // 学生参加・更新の監視
    const participantsSubscription = supabase
      .channel('participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Participant change:', payload)
          // 学生リストを更新
          fetchStudents(sessionId)
        }
      )
      .subscribe()

    // チャットメッセージ監視
    const chatSubscription = supabase
      .channel('chat-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          setMessages(prev => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      participantsSubscription.unsubscribe()
      chatSubscription.unsubscribe()
    }
  }

  // 学生データ再取得
  const fetchStudents = async (sessionId: string) => {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at')

    if (data) {
      const transformedStudents: Student[] = data.map(student => ({
        id: student.id,
        student_name: student.student_name,
        student_id: student.student_id,
        seat_position: student.seat_position,
        topic_title: student.topic_title,
        topic_content: student.topic_content,
        status: getStudentStatus(student),
        joined_at: student.joined_at,
        updated_at: student.updated_at
      }))
      
      setStudents(transformedStudents)
      updateStats(transformedStudents, messages)
    }
  }

  // 学生ステータスの色
  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'joined': return 'bg-gray-100 text-gray-800'
      case 'seated': return 'bg-blue-100 text-blue-800'
      case 'submitted': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // 学生ステータスのラベル
  const getStatusLabel = (status: Student['status']) => {
    switch (status) {
      case 'joined': return '参加済み'
      case 'seated': return '着席済み'
      case 'submitted': return '提出済み'
      case 'active': return '議論中'
      default: return '不明'
    }
  }

  // チャット管理ハンドラー
  const handleMessageFlag = (messageId: string, reason: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, flagged: true, flag_reason: reason }
        : msg
    ))
  }

  const handleMessageApprove = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, moderated: true, moderated_by: 'teacher', moderated_at: new Date().toISOString() }
        : msg
    ))
  }

  const handleMessageHide = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }

  // クイックツールハンドラー
  const handleCreatePoll = (poll: any) => {
    console.log('Creating poll:', poll)
    // TODO: 実際の投票作成API呼び出し
  }

  const handleClosePoll = (pollId: string) => {
    console.log('Closing poll:', pollId)
    // TODO: 投票終了API呼び出し
  }

  const handleSendAnnouncement = (message: string, type: 'info' | 'warning' | 'success') => {
    console.log('Sending announcement:', message, type)
    // TODO: 全体お知らせAPI呼び出し
  }

  const handleManageGroups = (action: 'shuffle' | 'reset' | 'lock') => {
    console.log('Managing groups:', action)
    // TODO: グループ管理API呼び出し
  }

  const handleManageSession = (action: 'pause' | 'resume' | 'extend' | 'close') => {
    console.log('Managing session:', action)
    // TODO: セッション管理API呼び出し
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">👨‍🏫</div>
          <div className="text-lg text-gray-600">教員ダッシュボードを読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                教員ダッシュボード
              </h1>
              <p className="text-gray-600 mt-1">
                セッション: {sessionCode} • リアルタイム監視中
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">オンライン</span>
              </div>
              <button
                onClick={() => window.location.href = `/classroom/${sessionCode}`}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                生徒画面を見る
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メイン統計パネル */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600">総参加者数</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.seatedStudents}</div>
            <div className="text-sm text-gray-600">着席済み</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{stats.submittedTopics}</div>
            <div className="text-sm text-gray-600">トピック提出</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">{stats.activeDiscussion}</div>
            <div className="text-sm text-gray-600">議論参加中</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-indigo-600">{stats.totalMessages}</div>
            <div className="text-sm text-gray-600">チャット数</div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 学生監視パネル */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  学生監視パネル
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {students.map(student => (
                    <div
                      key={student.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedStudent?.id === student.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="font-medium text-gray-900">
                            {student.student_name}
                          </div>
                          {student.student_id && (
                            <div className="text-sm text-gray-500">
                              #{student.student_id}
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                          {getStatusLabel(student.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">座席:</span>
                          <span className="ml-2 text-gray-900">
                            {student.seat_position || '未選択'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">参加:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(student.joined_at).toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {student.topic_title && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {student.topic_title}
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {student.topic_content}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* チャット監視パネル */}
          <div className="lg:col-span-1">
            <TeacherChatModeration
              sessionId={sessionCode}
              messages={messages}
              onMessageFlag={handleMessageFlag}
              onMessageApprove={handleMessageApprove}
              onMessageHide={handleMessageHide}
            />
          </div>
        </div>

        {/* クイックツールパネル */}
        <div className="mt-8">
          <TeacherQuickTools
            sessionCode={sessionCode}
            onCreatePoll={handleCreatePoll}
            onClosePoll={handleClosePoll}
            onSendAnnouncement={handleSendAnnouncement}
            onManageGroups={handleManageGroups}
            onManageSession={handleManageSession}
          />
        </div>

        {/* 参加分析パネル */}
        <div className="mt-8">
          <ParticipationAnalytics
            sessionCode={sessionCode}
            participants={students}
            messages={messages}
          />
        </div>

        {/* 学生詳細パネル */}
        {selectedStudent && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                学生詳細: {selectedStudent.student_name}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">基本情報</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">名前:</span>
                      <span>{selectedStudent.student_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">出席番号:</span>
                      <span>{selectedStudent.student_id || '未設定'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">座席:</span>
                      <span>{selectedStudent.seat_position || '未選択'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ステータス:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedStudent.status)}`}>
                        {getStatusLabel(selectedStudent.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">トピック</h3>
                  {selectedStudent.topic_title ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-700">タイトル</div>
                        <div className="text-sm text-gray-900">{selectedStudent.topic_title}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">内容</div>
                        <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                          {selectedStudent.topic_content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">トピック未提出</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}