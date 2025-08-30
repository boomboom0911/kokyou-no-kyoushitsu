'use client'

import React, { useState, useEffect } from 'react'
import { ParticipantData } from '@/lib/auth'

interface TeacherClassroomViewProps {
  sessionData: {
    sessionCode: string
    sessionId: string
    className: string
    date: string
    period: number
    teacherTopicTitle?: string
    teacherTopicContent?: string
  }
}

export default function TeacherClassroomView({ sessionData }: TeacherClassroomViewProps) {
  const [participants, setParticipants] = useState<ParticipantData[]>([])
  const [totalStudents] = useState(42) // 固定値（実際には動的に設定）

  // デモデータ
  useEffect(() => {
    const mockParticipants: ParticipantData[] = [
      {
        id: '1',
        sessionId: sessionData.sessionId,
        studentName: '田中太郎',
        studentId: '001',
        seatPosition: 1,
        topicTitle: '選挙権について',
        topicContent: '18歳選挙権の意義と課題について考えてみました。',
        likeCount: 3,
        commentCount: 2,
        joinedAt: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: '2',
        sessionId: sessionData.sessionId,
        studentName: '佐藤花子',
        studentId: '002',
        seatPosition: 2,
        topicTitle: '政治参加',
        topicContent: '政治に関心を持つにはどうすればいいか考察しています。',
        likeCount: 1,
        commentCount: 1,
        joinedAt: new Date(Date.now() - 400000).toISOString()
      },
      {
        id: '3',
        sessionId: sessionData.sessionId,
        studentName: '鈴木次郎',
        studentId: '003',
        seatPosition: 4,
        topicTitle: '民主主義の本質とは',
        topicContent: '古代ギリシャから始まった民主主義は、現代でも多くの課題を抱えています。',
        likeCount: 5,
        commentCount: 3,
        joinedAt: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: '4',
        sessionId: sessionData.sessionId,
        studentName: '山田五郎',
        studentId: '006',
        seatPosition: 7,
        joinedAt: new Date(Date.now() - 100000).toISOString()
      }
    ]
    setParticipants(mockParticipants)
  }, [sessionData.sessionId])

  const participantsWithTopics = participants.filter(p => p.topicTitle)
  const participantsWithoutTopics = participants.filter(p => !p.topicTitle)
  const totalLikes = participantsWithTopics.reduce((sum, p) => sum + (p.likeCount || 0), 0)
  const totalComments = participantsWithTopics.reduce((sum, p) => sum + (p.commentCount || 0), 0)
  const participationRate = Math.round((participants.length / totalStudents) * 100)
  const submissionRate = Math.round((participantsWithTopics.length / participants.length) * 100)

  return (
    <div className="p-6 space-y-6">
      {/* セッション情報 */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-purple-800 mb-2">
              👨‍🏫 授業進行管理
            </h1>
            <div className="text-purple-700">
              <div className="font-semibold">{sessionData.className} - {sessionData.period}時限</div>
              <div className="text-sm">{sessionData.date}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-600 mb-1">セッションコード</div>
            <div className="text-3xl font-mono font-bold text-purple-800">
              {sessionData.sessionCode}
            </div>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-600 font-medium">参加者数</div>
              <div className="text-2xl font-bold text-blue-800">{participants.length}</div>
              <div className="text-xs text-blue-500">/{totalStudents}人 ({participationRate}%)</div>
            </div>
            <div className="text-3xl">🙋‍♂️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-600 font-medium">提出済み</div>
              <div className="text-2xl font-bold text-green-800">{participantsWithTopics.length}</div>
              <div className="text-xs text-green-500">/{participants.length}人 ({submissionRate}%)</div>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-red-600 font-medium">いいね総数</div>
              <div className="text-2xl font-bold text-red-800">{totalLikes}</div>
              <div className="text-xs text-red-500">みんなの評価</div>
            </div>
            <div className="text-3xl">👍</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-600 font-medium">コメント数</div>
              <div className="text-2xl font-bold text-purple-800">{totalComments}</div>
              <div className="text-xs text-purple-500">活発な議論</div>
            </div>
            <div className="text-3xl">💬</div>
          </div>
        </div>
      </div>

      {/* 参加者一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 提出済み */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            📝 トピック提出済み ({participantsWithTopics.length}人)
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {participantsWithTopics.map(participant => (
              <div key={participant.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-green-800">
                        🎓 {participant.studentName}
                      </span>
                      <span className="text-xs text-green-600 bg-green-200 px-2 py-0.5 rounded-full">
                        座席{participant.seatPosition}
                      </span>
                    </div>
                    <div className="text-sm text-green-700 font-medium mb-1">
                      {participant.topicTitle}
                    </div>
                    {participant.topicContent && (
                      <div className="text-xs text-green-600 line-clamp-2">
                        {participant.topicContent}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-3">
                    {participant.likeCount! > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        👍{participant.likeCount}
                      </span>
                    )}
                    {participant.commentCount! > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        💬{participant.commentCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {participantsWithTopics.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                まだ提出者がいません
              </div>
            )}
          </div>
        </div>

        {/* 未提出 */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            ⏳ 参加中・未提出 ({participantsWithoutTopics.length}人)
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {participantsWithoutTopics.map(participant => (
              <div key={participant.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-yellow-800">
                      🎓 {participant.studentName}
                    </span>
                    <span className="text-xs text-yellow-600 bg-yellow-200 px-2 py-0.5 rounded-full">
                      座席{participant.seatPosition}
                    </span>
                  </div>
                  <div className="text-xs text-yellow-600">
                    {new Date(participant.joinedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}参加
                  </div>
                </div>
              </div>
            ))}
            {participantsWithoutTopics.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                全員提出済みです！
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 教室画面リンク */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border-2 border-teal-200 p-6">
        <h3 className="text-lg font-bold text-teal-800 mb-4">🖥️ 教室画面</h3>
        <div className="flex items-center justify-between">
          <div className="text-sm text-teal-700">
            生徒と同じ画面で授業の様子をリアルタイムで確認できます
          </div>
          <a
            href="/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
          >
            教室画面を開く ↗
          </a>
        </div>
      </div>
    </div>
  )
}