'use client'

import React, { useState, useEffect } from 'react'

interface ParticipantStats {
  id: string
  student_name: string
  student_id?: string
  participation_score: number
  topic_quality: number
  chat_activity: number
  interaction_count: number
  session_duration: number
  engagement_level: 'high' | 'medium' | 'low'
  joined_at: string
  last_activity: string
}

interface SessionAnalytics {
  sessionCode: string
  totalParticipants: number
  averageParticipation: number
  totalInteractions: number
  sessionDuration: number
  topicSubmissionRate: number
  chatMessageCount: number
  peakEngagementTime: string
  summary: {
    mostActiveStudents: ParticipantStats[]
    leastActiveStudents: ParticipantStats[]
    topicQualityDistribution: { high: number; medium: number; low: number }
    timelineData: { time: string; engagement: number }[]
  }
}

interface ParticipationAnalyticsProps {
  sessionCode: string
  participants: any[]
  messages: any[]
}

export default function ParticipationAnalytics({
  sessionCode,
  participants,
  messages
}: ParticipationAnalyticsProps) {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null)
  const [selectedView, setSelectedView] = useState<'overview' | 'individuals' | 'timeline' | 'export'>('overview')
  const [sortBy, setSortBy] = useState<'participation' | 'quality' | 'activity'>('participation')

  // 分析データの計算
  useEffect(() => {
    if (participants.length === 0) return

    const participantStats: ParticipantStats[] = participants.map(participant => {
      // メッセージ数の計算
      const chatCount = messages.filter(msg => msg.sender_name === participant.student_name).length
      
      // 参加スコアの計算（0-100）
      const participationScore = calculateParticipationScore(participant, chatCount)
      
      // トピック質量スコア（0-100）
      const topicQuality = calculateTopicQuality(participant)
      
      // セッション継続時間（分）
      const sessionDuration = calculateSessionDuration(participant)
      
      // エンゲージメントレベル
      const engagementLevel = getEngagementLevel(participationScore)
      
      return {
        id: participant.id,
        student_name: participant.student_name,
        student_id: participant.student_id,
        participation_score: participationScore,
        topic_quality: topicQuality,
        chat_activity: chatCount,
        interaction_count: chatCount + (participant.topic_title ? 1 : 0),
        session_duration: sessionDuration,
        engagement_level: engagementLevel,
        joined_at: participant.joined_at,
        last_activity: participant.updated_at
      }
    })

    // セッション全体の分析
    const sessionAnalytics: SessionAnalytics = {
      sessionCode,
      totalParticipants: participants.length,
      averageParticipation: participantStats.reduce((sum, p) => sum + p.participation_score, 0) / participants.length,
      totalInteractions: participantStats.reduce((sum, p) => sum + p.interaction_count, 0),
      sessionDuration: Math.max(...participantStats.map(p => p.session_duration)),
      topicSubmissionRate: (participants.filter(p => p.topic_title).length / participants.length) * 100,
      chatMessageCount: messages.length,
      peakEngagementTime: calculatePeakEngagementTime(),
      summary: {
        mostActiveStudents: participantStats
          .sort((a, b) => b.participation_score - a.participation_score)
          .slice(0, 3),
        leastActiveStudents: participantStats
          .sort((a, b) => a.participation_score - b.participation_score)
          .slice(0, 3),
        topicQualityDistribution: calculateQualityDistribution(participantStats),
        timelineData: generateTimelineData()
      }
    }

    setAnalytics(sessionAnalytics)
  }, [participants, messages, sessionCode])

  // 参加スコア計算
  const calculateParticipationScore = (participant: any, chatCount: number): number => {
    let score = 0
    
    // 基本参加（10点）
    score += 10
    
    // 座席選択（10点）
    if (participant.seat_position) score += 10
    
    // トピック提出（30点）
    if (participant.topic_title && participant.topic_content) {
      score += 30
      // トピック長さボーナス（最大10点）
      const contentLength = participant.topic_content.length
      score += Math.min(10, Math.floor(contentLength / 50))
    }
    
    // チャット活動（最大40点）
    score += Math.min(40, chatCount * 5)
    
    return Math.min(100, score)
  }

  // トピック質量スコア計算
  const calculateTopicQuality = (participant: any): number => {
    if (!participant.topic_content) return 0
    
    const content = participant.topic_content
    let score = 0
    
    // 文字数（最大30点）
    score += Math.min(30, Math.floor(content.length / 10))
    
    // キーワード含有（最大40点）
    const qualityKeywords = ['なぜ', '理由', '原因', '解決', '提案', '考察', '分析', '問題', '課題', '改善']
    const keywordCount = qualityKeywords.filter(keyword => content.includes(keyword)).length
    score += Math.min(40, keywordCount * 8)
    
    // 具体性（最大30点）
    const specificityIndicators = ['例えば', '具体的に', '実際に', 'データ', '事例', '体験']
    const specificityCount = specificityIndicators.filter(indicator => content.includes(indicator)).length
    score += Math.min(30, specificityCount * 10)
    
    return Math.min(100, score)
  }

  // セッション継続時間計算
  const calculateSessionDuration = (participant: any): number => {
    const joinTime = new Date(participant.joined_at).getTime()
    const lastActivity = new Date(participant.updated_at).getTime()
    return Math.floor((lastActivity - joinTime) / (1000 * 60)) // 分単位
  }

  // エンゲージメントレベル判定
  const getEngagementLevel = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 80) return 'high'
    if (score >= 60) return 'medium'
    return 'low'
  }

  // ピークエンゲージメント時間計算
  const calculatePeakEngagementTime = (): string => {
    if (messages.length === 0) return '未計測'
    
    // 10分間隔でメッセージ数を集計
    const intervals = new Map<string, number>()
    
    messages.forEach(message => {
      const time = new Date(message.created_at)
      const intervalKey = `${time.getHours()}:${Math.floor(time.getMinutes() / 10) * 10}`
      intervals.set(intervalKey, (intervals.get(intervalKey) || 0) + 1)
    })
    
    let maxCount = 0
    let peakTime = ''
    
    intervals.forEach((count, time) => {
      if (count > maxCount) {
        maxCount = count
        peakTime = time
      }
    })
    
    return peakTime || '未計測'
  }

  // 品質分布計算
  const calculateQualityDistribution = (stats: ParticipantStats[]) => {
    const distribution = { high: 0, medium: 0, low: 0 }
    
    stats.forEach(stat => {
      if (stat.topic_quality >= 80) distribution.high++
      else if (stat.topic_quality >= 60) distribution.medium++
      else distribution.low++
    })
    
    return distribution
  }

  // タイムライン データ生成
  const generateTimelineData = () => {
    if (messages.length === 0) return []
    
    // 15分間隔でエンゲージメントを計算
    const timelineData = []
    const startTime = new Date(messages[0].created_at)
    const endTime = new Date(messages[messages.length - 1].created_at)
    
    for (let time = startTime; time <= endTime; time.setMinutes(time.getMinutes() + 15)) {
      const intervalEnd = new Date(time.getTime() + 15 * 60 * 1000)
      const messagesInInterval = messages.filter(msg => {
        const msgTime = new Date(msg.created_at)
        return msgTime >= time && msgTime < intervalEnd
      }).length
      
      timelineData.push({
        time: time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        engagement: messagesInInterval
      })
    }
    
    return timelineData
  }

  // CSV エクスポート
  const exportToCSV = () => {
    if (!analytics) return
    
    const participantStats = participants.map(participant => {
      const stats = analytics.summary.mostActiveStudents
        .concat(analytics.summary.leastActiveStudents)
        .find(s => s.id === participant.id)
      
      return {
        名前: participant.student_name,
        出席番号: participant.student_id || '',
        参加スコア: stats?.participation_score || 0,
        トピック質量: stats?.topic_quality || 0,
        チャット数: stats?.chat_activity || 0,
        エンゲージメント: stats?.engagement_level || 'low',
        セッション時間: stats?.session_duration || 0,
        参加時刻: new Date(participant.joined_at).toLocaleTimeString('ja-JP'),
        最終活動: new Date(participant.updated_at).toLocaleTimeString('ja-JP')
      }
    })
    
    // CSV文字列作成
    const headers = Object.keys(participantStats[0])
    const csvContent = [
      headers.join(','),
      ...participantStats.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n')
    
    // ダウンロード
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `participation_report_${sessionCode}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-lg text-gray-600">分析データを計算中...</div>
        </div>
      </div>
    )
  }

  const sortedParticipants = participants
    .map(p => {
      const stats = analytics.summary.mostActiveStudents
        .concat(analytics.summary.leastActiveStudents)
        .find(s => s.id === p.id) || {
        participation_score: 0,
        topic_quality: 0,
        chat_activity: 0
      }
      return { ...p, ...stats }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'participation': return b.participation_score - a.participation_score
        case 'quality': return b.topic_quality - a.topic_quality
        case 'activity': return b.chat_activity - a.chat_activity
        default: return 0
      }
    })

  return (
    <div className="bg-white rounded-lg shadow">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            参加分析レポート
          </h2>
          <div className="flex items-center gap-4">
            {/* ビュー切替 */}
            <div className="flex space-x-1">
              {[
                { id: 'overview', label: '概要', icon: '📊' },
                { id: 'individuals', label: '個別', icon: '👤' },
                { id: 'timeline', label: 'タイムライン', icon: '📈' },
                { id: 'export', label: 'エクスポート', icon: '📥' }
              ].map(view => (
                <button
                  key={view.id}
                  onClick={() => setSelectedView(view.id as any)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedView === view.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {view.icon} {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-6">
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* サマリー統計 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.averageParticipation.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">平均参加スコア</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.topicSubmissionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">トピック提出率</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.totalInteractions}
                </div>
                <div className="text-sm text-gray-600">総インタラクション数</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.peakEngagementTime}
                </div>
                <div className="text-sm text-gray-600">ピーク時間</div>
              </div>
            </div>

            {/* トップパフォーマー */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">最も活発な参加者</h3>
                <div className="space-y-2">
                  {analytics.summary.mostActiveStudents.map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                        <span className="font-medium">{student.student_name}</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {student.participation_score}点
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">要フォロー対象</h3>
                <div className="space-y-2">
                  {analytics.summary.leastActiveStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🤝</span>
                        <span className="font-medium">{student.student_name}</span>
                      </div>
                      <span className="text-sm font-medium text-yellow-600">
                        {student.participation_score}点
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'individuals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">個別参加状況</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-3 py-1"
              >
                <option value="participation">参加スコア順</option>
                <option value="quality">トピック質量順</option>
                <option value="activity">活動量順</option>
              </select>
            </div>
            
            <div className="space-y-3">
              {sortedParticipants.map((participant) => (
                <div key={participant.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-medium text-gray-900">
                        {participant.student_name}
                      </span>
                      {participant.student_id && (
                        <span className="ml-2 text-sm text-gray-500">
                          #{participant.student_id}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {participant.participation_score || 0}点
                      </div>
                      <div className="text-xs text-gray-500">参加スコア</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {participant.topic_quality || 0}
                      </div>
                      <div className="text-gray-500">トピック質量</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {participant.chat_activity || 0}
                      </div>
                      <div className="text-gray-500">チャット数</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {participant.session_duration || 0}分
                      </div>
                      <div className="text-gray-500">セッション時間</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'timeline' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">エンゲージメント推移</h3>
            <div className="h-64 flex items-end justify-center space-x-2">
              {analytics.summary.timelineData.map((data, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-t w-8 transition-all hover:bg-blue-600"
                    style={{ 
                      height: `${Math.max(8, (data.engagement / Math.max(...analytics.summary.timelineData.map(d => d.engagement))) * 200)}px`
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-1 rotate-45 whitespace-nowrap">
                    {data.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'export' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">レポート出力</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={exportToCSV}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-gray-900">CSV形式でダウンロード</div>
                <div className="text-sm text-gray-500 mt-1">Excel等で開ける形式</div>
              </button>
              
              <button
                onClick={() => window.print()}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-center"
              >
                <div className="text-2xl mb-2">🖨️</div>
                <div className="font-medium text-gray-900">印刷用レポート</div>
                <div className="text-sm text-gray-500 mt-1">PDFで保存可能</div>
              </button>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">レポート内容</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 各生徒の参加スコア（座席選択、トピック提出、チャット活動）</li>
                <li>• トピック内容の質量評価</li>
                <li>• セッション参加時間と活動時間</li>
                <li>• エンゲージメントレベル（高・中・低）</li>
                <li>• セッション全体の統計情報</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}