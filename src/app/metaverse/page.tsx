'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { logViewing, logLike, logSearch, updatePresence, getActivePresences, getPersonalStats, deactivatePresence } from '@/lib/metaverse-api'

interface SessionCard {
  id: string
  sessionCode: string
  className: string
  date: string
  period: number
  teacherTopicTitle: string | null
  teacherTopicContent: string | null
  participantCount: number
  topicCount: number
  status: 'active' | 'closed'
  createdAt: string
}

interface ViewingLog {
  sessionId: string
  viewedAt: string
  duration: number
}

interface ActionLog {
  type: 'like' | 'comment' | 'view' | 'search'
  target: string
  content?: string
  timestamp: string
}

interface PersonalStats {
  viewingCount: number
  likeCount: number
  commentCount: number
  searchCount: number
}

export default function MetaversePage() {
  const [sessions, setSessions] = useState<SessionCard[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>('2024-08')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showRealtimeMap, setShowRealtimeMap] = useState(true)
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([])
  const [currentUsers, setCurrentUsers] = useState<string[]>([])
  const [personalStats, setPersonalStats] = useState<PersonalStats>({ viewingCount: 0, likeCount: 0, commentCount: 0, searchCount: 0 })
  const [currentUser] = useState('匿名ユーザー') // 実際の実装では認証から取得
  const [isLoading, setIsLoading] = useState(true)

  // 模擬データの生成
  useEffect(() => {
    const generateMockSessions = () => {
      const classes = ['1組', '2組', '3組', '4組', '5組']
      const topics = [
        '民主主義の理念', '選挙制度の仕組み', '政治参加の意義', '投票行動の分析', '政治制度の比較',
        '憲法と人権', '地方自治の役割', '国際政治の理解', 'メディアと政治', '市民社会の形成'
      ]
      
      const mockSessions: SessionCard[] = []
      
      // 過去3ヶ月分のデータを生成
      for (let month = 6; month <= 8; month++) {
        for (let week = 0; week < 4; week++) {
          classes.forEach((className, classIndex) => {
            const date = `2024-${month.toString().padStart(2, '0')}-${(week * 7 + classIndex + 1).toString().padStart(2, '0')}`
            const topicIndex = (month - 6) * 20 + week * 5 + classIndex
            
            mockSessions.push({
              id: `session_${month}_${week}_${classIndex}`,
              sessionCode: `AB${month}${week}CD${classIndex}${Math.floor(Math.random() * 10)}`,
              className,
              date,
              period: 3,
              teacherTopicTitle: topics[topicIndex % topics.length],
              teacherTopicContent: `${topics[topicIndex % topics.length]}について考察します`,
              participantCount: Math.floor(Math.random() * 10) + 30,
              topicCount: Math.floor(Math.random() * 15) + 20,
              status: 'closed',
              createdAt: `${date}T10:30:00Z`
            })
          })
        }
      }
      
      setSessions(mockSessions)
      setIsLoading(false)
    }

    generateMockSessions()

    // LocalStorageから行動ログを読み込み
    const savedLogs = localStorage.getItem('metaverse_action_logs')
    if (savedLogs) {
      setActionLogs(JSON.parse(savedLogs))
    }

    // 個人統計とプレゼンス初期化
    loadPersonalStats()
    loadActiveUsers()
    initializePresence()
  }, [])

  // 個人統計読み込み
  const loadPersonalStats = async () => {
    const stats = await getPersonalStats(currentUser)
    setPersonalStats(stats)
  }

  // アクティブユーザー読み込み
  const loadActiveUsers = async () => {
    const presences = await getActivePresences()
    setCurrentUsers(presences.map(p => p.user_name))
  }

  // プレゼンス初期化
  const initializePresence = async () => {
    await updatePresence({
      user_name: currentUser,
      current_page: '/metaverse',
      viewing_element: 'main_grid'
    })

    // 5秒ごとにプレゼンス更新
    const presenceInterval = setInterval(async () => {
      await updatePresence({
        user_name: currentUser,
        current_page: '/metaverse',
        viewing_element: 'main_grid'
      })
      await loadActiveUsers()
    }, 5000)

    // ページ離脱時のクリーンアップ
    window.addEventListener('beforeunload', () => {
      deactivatePresence(currentUser)
    })

    return () => {
      clearInterval(presenceInterval)
      deactivatePresence(currentUser)
    }
  }

  // 行動ログの記録
  const logAction = (action: ActionLog) => {
    const newLogs = [...actionLogs, action]
    setActionLogs(newLogs)
    localStorage.setItem('metaverse_action_logs', JSON.stringify(newLogs))
  }

  // セッションカードクリック時の行動記録
  const handleSessionClick = async (session: SessionCard) => {
    // LocalStorage用の行動ログ（後方互換性）
    logAction({
      type: 'view',
      target: `${session.className}_${session.date}_${session.teacherTopicTitle}`,
      timestamp: new Date().toISOString()
    })

    // Supabase用の閲覧ログ
    await logViewing({
      user_name: currentUser,
      session_id: session.id,
      viewing_context: {
        from: 'metaverse_grid',
        class: session.className,
        topic: session.teacherTopicTitle,
        month_filter: selectedMonth,
        search_keyword: searchKeyword
      }
    })

    // プレゼンス更新
    await updatePresence({
      user_name: currentUser,
      current_page: '/metaverse',
      viewing_element: `${session.className}_${session.teacherTopicTitle}`
    })

    // 統計更新
    await loadPersonalStats()
    
    // 実際の教室画面へ遷移（デモ用アラート）
    alert(`${session.className}の「${session.teacherTopicTitle}」を閲覧中...\n\n参加者: ${session.participantCount}人\nトピック: ${session.topicCount}件\n\n※実際の実装では詳細画面に遷移します`)
  }

  // いいねボタンクリック
  const handleLike = (session: SessionCard) => {
    logAction({
      type: 'like',
      target: `${session.className}_${session.teacherTopicTitle}`,
      timestamp: new Date().toISOString()
    })
  }

  // 検索実行
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    if (keyword.trim()) {
      logAction({
        type: 'search',
        target: keyword,
        timestamp: new Date().toISOString()
      })
    }
  }

  // フィルタリングされたセッション
  const filteredSessions = sessions.filter(session => {
    const monthMatch = session.date.startsWith(selectedMonth)
    const keywordMatch = !searchKeyword || 
      session.teacherTopicTitle?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      session.className.includes(searchKeyword)
    return monthMatch && keywordMatch
  })

  // クラス別にグループ化
  const sessionsByClass = {
    '1組': filteredSessions.filter(s => s.className === '1組'),
    '2組': filteredSessions.filter(s => s.className === '2組'),
    '3組': filteredSessions.filter(s => s.className === '3組'),
    '4組': filteredSessions.filter(s => s.className === '4組'),
    '5組': filteredSessions.filter(s => s.className === '5組')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">メタバース教室を準備中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-md border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                ← 公共のキョウシツに戻る
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">🌐 メタバース教室</h1>
                <p className="text-sm text-gray-600">これまでの授業を俯瞰して、学習のつながりを発見しよう</p>
              </div>
            </div>
            
            {/* メタブレインと忍びの地図 */}
            <div className="flex items-center gap-4">
              {/* メタブレインへのリンク */}
              <Link
                href={`/metabrain/${encodeURIComponent(currentUser)}`}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-md"
              >
                🧠 メタブレイン
              </Link>
              
              {/* 忍びの地図切り替え */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">🗺️ リアルタイム表示</span>
                <button
                  onClick={() => setShowRealtimeMap(!showRealtimeMap)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showRealtimeMap ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showRealtimeMap ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* メインコンテンツ */}
          <div className="flex-1">
            {/* フィルタリング */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex gap-2">
                  {['2024-06', '2024-07', '2024-08'].map(month => (
                    <button
                      key={month}
                      onClick={() => setSelectedMonth(month)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedMonth === month 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {month === '2024-06' ? '📅 6月' : month === '2024-07' ? '7月' : '8月'}
                    </button>
                  ))}
                </div>
                
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 キーワード検索（授業内容、クラス名）"
                    value={searchKeyword}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* 5クラス × 時系列グリッド */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📚 授業一覧 - {selectedMonth.replace('2024-', '')}月</h2>
              
              {/* クラスヘッダー */}
              <div className="grid grid-cols-5 gap-4 mb-4">
                {Object.keys(sessionsByClass).map(className => (
                  <div key={className} className="text-center font-bold text-gray-700 py-2 bg-gray-50 rounded-lg">
                    {className}
                  </div>
                ))}
              </div>
              
              {/* セッションカード */}
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(sessionsByClass).map(([className, classSessions]) => (
                  <div key={className} className="space-y-3">
                    {classSessions.length > 0 ? (
                      classSessions.map(session => (
                        <div
                          key={session.id}
                          onClick={() => handleSessionClick(session)}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:bg-blue-50 transition-all duration-200 min-h-[120px] relative"
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {session.date.split('-')[2]}/{session.date.split('-')[1]} {session.period}限
                          </div>
                          <div className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                            {session.teacherTopicTitle}
                          </div>
                          <div className="text-xs text-gray-600 mb-3">
                            👥 {session.participantCount}/40人 📝 {session.topicCount}件
                          </div>
                          
                          <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              閲覧回数: {Math.floor(Math.random() * 15) + 5}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLike(session)
                              }}
                              className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              👍 {Math.floor(Math.random() * 8) + 1}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-[120px] flex items-center justify-center text-gray-500 text-sm">
                        データなし
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 個人の行動ログサマリー */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 あなたの学習活動</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{actionLogs.filter(l => l.type === 'view').length}</div>
                  <div className="text-sm text-gray-600">閲覧した授業</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{actionLogs.filter(l => l.type === 'like').length}</div>
                  <div className="text-sm text-gray-600">いいねした授業</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{actionLogs.filter(l => l.type === 'comment').length}</div>
                  <div className="text-sm text-gray-600">コメントした授業</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{actionLogs.filter(l => l.type === 'search').length}</div>
                  <div className="text-sm text-gray-600">検索した回数</div>
                </div>
              </div>
            </div>
          </div>

          {/* 忍びの地図サイドパネル */}
          {showRealtimeMap && (
            <div className="w-80 bg-white rounded-lg shadow-md p-4 h-fit">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🗺️ 忍びの地図</h3>
              <div className="text-sm text-gray-600 mb-4">現在 {currentUsers.length}人が閲覧中</div>
              
              <div className="space-y-3">
                {currentUsers.map((user, index) => (
                  <div key={user} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-600">👤</span>
                      <span className="font-medium text-gray-800">{user}さん</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {index === 0 ? '→ 「7月 民主主義の理念」を閲覧中' : 
                       index === 1 ? '→ 検索機能を使用中' : 
                       '→ 8月の授業を探索中'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm text-yellow-800">
                  💡 他の人が見ている授業もチェックしてみよう！
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}