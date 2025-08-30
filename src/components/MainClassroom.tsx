'use client'

import React, { useState, useEffect } from 'react'
import SeatingChart from './SeatingChart'
import Chat from './Chat'
import TopicSubmissionModal from './TopicSubmissionModal'
import PWAPrompt from './PWAPrompt'
import PerformanceMonitor from './PerformanceMonitor'
import { ParticipantData, CommentData } from '@/lib/auth'

interface ChatMessage {
  id: string
  senderName: string
  message: string
  isTeacher: boolean
  createdAt: string
}

interface MainClassroomProps {
  sessionId: string
  sessionData: {
    id: string
    className: string
    date: string
    period: number
    teacherTopicTitle?: string
    teacherTopicContent?: string
  }
  currentUser: {
    name: string
    id?: string
    isTeacher?: boolean
  }
}

export default function MainClassroom({ sessionId, sessionData, currentUser }: MainClassroomProps) {
  const [participants, setParticipants] = useState<ParticipantData[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [comments, setComments] = useState<CommentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [selectedSeatForSubmission, setSelectedSeatForSubmission] = useState<number | null>(null)

  // モックデータを設定（開発用）
  useEffect(() => {
    // デモ用の参加者データ
    const mockParticipants: ParticipantData[] = [
      {
        id: '1',
        sessionId,
        studentName: '田中太郎',
        studentId: '001',
        seatPosition: 1,
        topicTitle: '選挙権について',
        topicContent: '18歳選挙権の意義と課題について考えてみました。若者の政治参加が重要だと思います。',
        likeCount: 3,
        commentCount: 2,
        joinedAt: new Date().toISOString()
      },
      {
        id: '2',
        sessionId,
        studentName: '佐藤花子',
        studentId: '002',
        seatPosition: 2,
        topicTitle: '政治参加',
        topicContent: '政治に関心を持つにはどうすればいいか考察しています。',
        likeCount: 1,
        commentCount: 1,
        joinedAt: new Date().toISOString()
      },
      {
        id: '3',
        sessionId,
        studentName: '鈴木次郎',
        studentId: '003',
        seatPosition: 4,
        topicTitle: '民主主義の本質とは',
        topicContent: '古代ギリシャから始まった民主主義は、現代でも多くの課題を抱えていると思います。若者の政治離れや投票率の低下など、民主主義を維持するために何が必要なのか考えたいです。',
        likeCount: 5,
        commentCount: 3,
        joinedAt: new Date().toISOString()
      },
      {
        id: '4',
        sessionId,
        studentName: '高橋三郎',
        studentId: '004',
        seatPosition: 5,
        topicTitle: '投票行動',
        topicContent: '投票に行く意味について考えています。',
        likeCount: 2,
        commentCount: 1,
        joinedAt: new Date().toISOString()
      },
      {
        id: '5',
        sessionId,
        studentName: '渡辺四郎',
        studentId: '005',
        seatPosition: 6,
        topicTitle: '政治制度',
        topicContent: '日本の政治制度について学習中です。',
        likeCount: 1,
        commentCount: 0,
        joinedAt: new Date().toISOString()
      },
      {
        id: '6',
        sessionId,
        studentName: '山田五郎',
        studentId: '006',
        seatPosition: 7,
        joinedAt: new Date().toISOString()
      },
      {
        id: '7',
        sessionId,
        studentName: '中村六郎',
        studentId: '007',
        seatPosition: 8,
        joinedAt: new Date().toISOString()
      }
    ]

    // デモ用のチャットメッセージ
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        senderName: '先生',
        message: '今日は投票制度について話しましょう',
        isTeacher: true,
        createdAt: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: '2',
        senderName: '田中太郎',
        message: '18歳選挙権の意味を知りたいです',
        isTeacher: false,
        createdAt: new Date(Date.now() - 400000).toISOString()
      },
      {
        id: '3',
        senderName: '佐藤花子',
        message: '政治に関心を持つにはどうすればいいですか？',
        isTeacher: false,
        createdAt: new Date(Date.now() - 200000).toISOString()
      },
      {
        id: '4',
        senderName: '鈴木次郎',
        message: '民主主義って古代ギリシャからですよね',
        isTeacher: false,
        createdAt: new Date(Date.now() - 100000).toISOString()
      }
    ]

    // デモ用のコメントデータ
    const mockComments: CommentData[] = [
      {
        id: 'c1',
        participantId: '1',
        senderName: '田中',
        content: '確かに投票率の低下は問題ですね',
        createdAt: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 'c2',
        participantId: '1',
        senderName: '佐藤',
        content: 'メディアリテラシーも重要だと思います',
        createdAt: new Date(Date.now() - 200000).toISOString()
      }
    ]

    setParticipants(mockParticipants)
    setChatMessages(mockMessages)
    setComments(mockComments)
    setIsLoading(false)
  }, [sessionId])

  // 座席選択処理
  const handleSeatSelect = async (seatPosition: number) => {
    setSelectedSeatForSubmission(seatPosition)
    setShowTopicModal(true)
  }

  // メッセージ送信処理
  const handleSendMessage = async (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: currentUser.name,
      message,
      isTeacher: currentUser.isTeacher || false,
      createdAt: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, newMessage])
  }

  // いいね処理
  const handleLike = (participantId: string) => {
    setParticipants(prev => prev.map(participant => {
      if (participant.id === participantId && participant.topicTitle) {
        return {
          ...participant,
          likeCount: (participant.likeCount || 0) + 1
        }
      }
      return participant
    }))
  }

  // コメント処理
  const handleComment = (participantId: string, comment: string) => {
    // 新しいコメントを追加
    const newComment: CommentData = {
      id: `c${Date.now()}`,
      participantId,
      senderName: currentUser.name,
      content: comment,
      createdAt: new Date().toISOString()
    }
    setComments(prev => [...prev, newComment])

    // 参加者のコメント数を更新
    setParticipants(prev => prev.map(participant => {
      if (participant.id === participantId && participant.topicTitle) {
        return {
          ...participant,
          commentCount: (participant.commentCount || 0) + 1
        }
      }
      return participant
    }))
  }

  // トピック提出処理
  const handleTopicSubmit = async (topicData: { title: string; content: string }) => {
    if (!selectedSeatForSubmission) return

    // 新しい参加者として追加（実際の実装では既存の参加者を更新）
    const newParticipant: ParticipantData = {
      id: `participant_${Date.now()}`,
      sessionId,
      studentName: currentUser.name,
      studentId: currentUser.id,
      seatPosition: selectedSeatForSubmission,
      topicTitle: topicData.title,
      topicContent: topicData.content,
      likeCount: 0,
      commentCount: 0,
      joinedAt: new Date().toISOString()
    }

    setParticipants(prev => [...prev, newParticipant])
    setShowTopicModal(false)
    setSelectedSeatForSubmission(null)
  }

  // トピック提出キャンセル処理
  const handleTopicCancel = () => {
    setShowTopicModal(false)
    setSelectedSeatForSubmission(null)
  }

  // 教卓カードの設定
  const teacherCard = {
    title: sessionData.teacherTopicTitle || '今日のテーマ',
    content: sessionData.teacherTopicContent || '民主主義と政治参加について考えてみましょう',
    date: sessionData.date,
    className: sessionData.className
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">教室を準備中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-200 via-teal-100 to-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-slate-100 via-teal-50 to-gray-100 border-b border-gray-300 px-6 py-3 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              🏛️ 公共のキョウシツ
            </h1>
            <p className="text-sm text-gray-600">
              {sessionData.className} - {sessionData.date} ({sessionData.period}時限)
            </p>
          </div>
          <div className="text-sm text-gray-600">
            参加者: {currentUser.name} {currentUser.isTeacher ? '(先生)' : ''}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* 座席表エリア */}
        <div className="flex-1 lg:flex-[7] overflow-auto">
          <SeatingChart
            sessionId={sessionId}
            participants={participants}
            teacherCard={teacherCard}
            currentUser={currentUser}
            onSeatSelect={handleSeatSelect}
            onLike={handleLike}
            onComment={handleComment}
            comments={comments}
          />
        </div>

        {/* チャットエリア */}
        <div className="flex-1 lg:flex-[3] border-t lg:border-t-0 lg:border-l border-gray-300 bg-gradient-to-br from-teal-50 to-slate-100 min-h-[300px] lg:min-h-0">
          <Chat
            sessionId={sessionId}
            currentUser={currentUser}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>

      {/* トピック提出モーダル */}
      {showTopicModal && selectedSeatForSubmission && (
        <TopicSubmissionModal
          seatPosition={selectedSeatForSubmission}
          studentName={currentUser.name}
          onSubmit={handleTopicSubmit}
          onCancel={handleTopicCancel}
        />
      )}

      {/* PWA インストール促進 */}
      <PWAPrompt />

      {/* パフォーマンス監視 */}
      <PerformanceMonitor />
    </div>
  )
}