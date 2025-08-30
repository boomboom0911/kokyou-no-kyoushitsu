'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface SessionInfo {
  sessionCode: string
  className: string
  date: string
  period: number
  teacherTopicTitle: string
  teacherTopicContent: string
  isActive: boolean
}

interface ParticipantInfo {
  studentName: string
  studentId?: string
  seatPosition?: { row: number; col: number }
  topicTitle?: string
  topicContent?: string
  submittedAt?: string
}

export default function ClassroomPage() {
  const params = useParams()
  const router = useRouter()
  const sessionCode = typeof params?.sessionCode === 'string' ? params.sessionCode : Array.isArray(params?.sessionCode) ? params.sessionCode[0] : ''
  
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [userInfo, setUserInfo] = useState<ParticipantInfo | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<{ row: number; col: number } | null>(null)
  const [topicTitle, setTopicTitle] = useState('')
  const [topicContent, setTopicContent] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    sender: string
    message: string
    timestamp: string
  }>>([])
  const [chatInput, setChatInput] = useState('')
  const [participants, setParticipants] = useState<ParticipantInfo[]>([])
  const [currentStep, setCurrentStep] = useState<'seat-selection' | 'topic-submission' | 'discussion'>('seat-selection')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // 座席詳細表示機能
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantInfo | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [likes, setLikes] = useState<{[key: string]: {count: number, liked: boolean}}>({})
  const [comments, setComments] = useState<{[key: string]: Array<{id: string, author: string, text: string, timestamp: string}>}>({})
  const [commentInput, setCommentInput] = useState('')

  // セッション情報の取得
  useEffect(() => {
    if (sessionCode) {
      loadSessionInfo()
      // ユーザー情報をLocalStorageから復元
      const savedUser = localStorage.getItem(`classroom_user_${sessionCode}`)
      if (savedUser) {
        const user = JSON.parse(savedUser)
        setUserInfo(user)
        if (user.seatPosition) {
          setSelectedSeat(user.seatPosition)
          setCurrentStep(user.topicTitle ? 'discussion' : 'topic-submission')
        }
      }
    }
  }, [sessionCode])

  const loadSessionInfo = async () => {
    setIsLoading(true)
    try {
      // デモ用のセッション情報生成
      const mockSession: SessionInfo = {
        sessionCode: sessionCode.toUpperCase(),
        className: '2組',
        date: new Date().toISOString().split('T')[0],
        period: 3,
        teacherTopicTitle: '民主主義と政治参加',
        teacherTopicContent: '現代社会において、若者の政治参加はなぜ重要なのでしょうか？投票だけでなく、様々な政治参加の形について考えてみましょう。',
        isActive: true
      }
      
      setSessionInfo(mockSession)
      loadParticipants()
      loadChatHistory()
    } catch (error) {
      console.error('Error loading session:', error)
      setError('セッション情報の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const loadParticipants = () => {
    // デモ用参加者データ
    const mockParticipants: ParticipantInfo[] = [
      { studentName: '田中花子', seatPosition: { row: 0, col: 1 }, topicTitle: '若者の政治意識向上について' },
      { studentName: '佐藤太郎', seatPosition: { row: 1, col: 3 }, topicTitle: 'SNSを活用した政治参加' },
      { studentName: '鈴木美咲', seatPosition: { row: 2, col: 0 }, topicTitle: '地方自治への参加方法' },
      { studentName: '高橋雄一', seatPosition: { row: 0, col: 4 }, topicTitle: '政治教育の重要性' },
    ]
    setParticipants(mockParticipants)
  }

  const loadChatHistory = () => {
    // デモ用チャット履歴
    const mockMessages = [
      { id: '1', sender: '田中花子', message: '政治に関心を持つきっかけが難しいですよね', timestamp: new Date(Date.now() - 300000).toISOString() },
      { id: '2', sender: '佐藤太郎', message: 'SNSで情報を得ることが多いです', timestamp: new Date(Date.now() - 180000).toISOString() },
      { id: '3', sender: '鈴木美咲', message: '地域のイベントに参加してみたいと思います', timestamp: new Date(Date.now() - 120000).toISOString() },
    ]
    setChatMessages(mockMessages)
  }

  // 座席選択
  const handleSeatSelect = (row: number, col: number) => {
    if (isLoading) return
    
    // 既に占有されている座席はチェック
    const isOccupied = participants.some(p => 
      p.seatPosition?.row === row && p.seatPosition?.col === col
    )
    
    if (isOccupied) {
      alert('この座席は既に使用されています')
      return
    }

    setSelectedSeat({ row, col })
  }

  // 座席確定
  const confirmSeatSelection = () => {
    if (!selectedSeat || !userInfo) return

    const updatedUser = { ...userInfo, seatPosition: selectedSeat }
    setUserInfo(updatedUser)
    localStorage.setItem(`classroom_user_${sessionCode}`, JSON.stringify(updatedUser))
    setCurrentStep('topic-submission')
  }

  // トピック提出
  const submitTopic = () => {
    if (!topicTitle.trim() || !userInfo) return

    const updatedUser = { 
      ...userInfo, 
      topicTitle: topicTitle.trim(),
      topicContent: topicContent.trim(),
      submittedAt: new Date().toISOString()
    }
    setUserInfo(updatedUser)
    localStorage.setItem(`classroom_user_${sessionCode}`, JSON.stringify(updatedUser))
    setCurrentStep('discussion')
  }

  // チャット送信
  const sendChatMessage = () => {
    if (!chatInput.trim() || !userInfo) return

    const newMessage = {
      id: Date.now().toString(),
      sender: userInfo.studentName,
      message: chatInput.trim(),
      timestamp: new Date().toISOString()
    }

    setChatMessages([...chatMessages, newMessage])
    setChatInput('')
  }

  // 座席詳細表示機能
  const handleSeatClick = (participant: ParticipantInfo) => {
    if (!participant || !participant.topicTitle) return
    setSelectedParticipant(participant)
    setShowDetailModal(true)
  }

  const handleLike = (participantName: string) => {
    setLikes(prev => ({
      ...prev,
      [participantName]: {
        count: (prev[participantName]?.count || 0) + (prev[participantName]?.liked ? -1 : 1),
        liked: !prev[participantName]?.liked
      }
    }))
  }

  const handleAddComment = (participantName: string) => {
    if (!commentInput.trim() || !userInfo) return
    
    const newComment = {
      id: Date.now().toString(),
      author: userInfo.studentName,
      text: commentInput.trim(),
      timestamp: new Date().toISOString()
    }

    setComments(prev => ({
      ...prev,
      [participantName]: [...(prev[participantName] || []), newComment]
    }))
    setCommentInput('')
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedParticipant(null)
    setCommentInput('')
  }

  // 座席グリッドの描画
  const renderSeatGrid = () => {
    const seats = []
    for (let row = 0; row < 6; row++) {
      const seatRow = []
      for (let col = 0; col < 6; col++) {
        let participant = participants.find(p => 
          p.seatPosition?.row === row && p.seatPosition?.col === col
        )
        
        // テスト用データの追加（デモ用）
        if (!participant && sessionInfo && [0,1,2,3].includes(row) && [0,1].includes(col)) {
          const testParticipants = [
            { studentName: "田中花子", topicTitle: "若者の政治参加促進", topicContent: "SNSやオンライン投票システムを活用して、若者がもっと気軽に政治に参加できる仕組みを作るべきだと思います。現在の投票率の低さは、政治への関心不足というより、参加しやすい環境が整っていないことが原因だと考えます。" },
            { studentName: "佐藤太郎", topicTitle: "地域コミュニティの活性化", topicContent: "地方自治の課題解決には、住民同士の繋がりが重要です。町内会やボランティア活動を通じて、地域の問題を共有し、協力して解決策を見つけることが民主主義の基本だと思います。" },
            { studentName: "田中太郎", topicTitle: "デジタル民主主義の可能性", topicContent: "ブロックチェーン技術を使った透明性の高い意思決定システムや、AIを活用した政策分析ツールなど、テクノロジーの力で民主主義をより効率的で公平なものにできるのではないでしょうか。" },
            { studentName: "山田太郎", topicTitle: "教育と民主主義", topicContent: "学校教育の段階から、議論や合意形成の方法を学ぶことが重要です。模擬議会や生徒会活動を通じて、民主的な意思決定プロセスを体験することで、将来の有権者としての素養を身につけられます。" },
          ]
          const testIndex = row * 2 + col
          if (testParticipants[testIndex]) {
            participant = {
              ...testParticipants[testIndex],
              seatPosition: { row, col },
              submittedAt: new Date().toISOString()
            }
          }
        }
        const isSelected = selectedSeat?.row === row && selectedSeat?.col === col
        const isMyLater = userInfo?.seatPosition?.row === row && userInfo?.seatPosition?.col === col
        
        seatRow.push(
          <div
            key={`${row}-${col}`}
            onClick={() => {
              if (participant && participant.topicTitle) {
                handleSeatClick(participant)
              } else if (currentStep === 'seat-selection' && !participant) {
                handleSeatSelect(row, col)
              }
            }}
            className={`
              w-28 h-20 m-2 rounded-xl border-2 transition-all duration-300 relative cursor-pointer transform
              ${participant ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-700 text-white shadow-lg' : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md'}
              ${isSelected ? 'ring-4 ring-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-200 scale-105' : ''}
              ${isMyLater ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-700 text-white shadow-lg' : ''}
              ${currentStep === 'seat-selection' && !participant ? 'hover:scale-[2.5] hover:shadow-2xl hover:z-50 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100' : participant ? 'hover:scale-[2] hover:shadow-2xl hover:z-50 hover:ring-4 hover:ring-emerald-400' : ''}
              ${participant?.topicTitle ? 'cursor-pointer' : participant ? 'cursor-default' : currentStep === 'seat-selection' ? 'cursor-pointer' : 'cursor-default'}
            `}
            title={participant ? `${participant.studentName}${participant.topicTitle ? ` - ${participant.topicTitle}` : ''}` : `座席 ${String.fromCharCode(65 + row)}-${col + 1}`}
          >
            {/* 座席番号 */}
            <div className="absolute top-1 left-2 text-xs font-bold opacity-75">
              {String.fromCharCode(65 + row)}{col + 1}
            </div>
            
            {/* 選択マーク */}
            {isSelected && !participant && (
              <div className="absolute top-1 right-2 text-yellow-600 font-bold text-lg">✓</div>
            )}
            
            {/* 参加者情報 */}
            <div className="flex flex-col items-center justify-center h-full p-1">
              {participant ? (
                <>
                  <div className="text-sm font-bold text-center leading-tight mb-1 truncate w-full">
                    {participant.studentName}
                  </div>
                  {participant.topicTitle && (
                    <div className="text-xs text-center leading-tight opacity-90 truncate w-full">
                      {participant.topicTitle.length > 12 ? participant.topicTitle.substring(0,11) + '...' : participant.topicTitle}
                    </div>
                  )}
                  
                  {/* いいね・コメント数バッジ */}
                  {participant.topicTitle && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                        <span>❤️</span>
                        <span>{likes[participant.studentName]?.count || Math.floor(Math.random() * 15) + 3}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                        <span>💬</span>
                        <span>{comments[participant.studentName]?.length || Math.floor(Math.random() * 8) + 1}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-400 text-2xl">
                  {isSelected ? '✓' : '🪑'}
                </div>
              )}
            </div>
          </div>
        )
      }
      seats.push(
        <div key={row} className="flex justify-center">
          {seatRow}
        </div>
      )
    }
    return seats
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">教室に入室中...</p>
        </div>
      </div>
    )
  }

  if (error || !sessionInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">入室できませんでした</h1>
          <p className="text-red-600 mb-4">{error || 'セッションが見つかりません'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <div className="bg-white shadow-md border-b-2 border-blue-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">📚</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {sessionInfo.className} {sessionInfo.period}時限 - {sessionInfo.teacherTopicTitle}
                </h1>
                <p className="text-sm text-gray-600">{sessionInfo.date} • セッション: {sessionInfo.sessionCode}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {userInfo ? `${userInfo.studentName}さん` : 'ゲスト'}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className={`w-2 h-2 rounded-full ${sessionInfo.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {sessionInfo.isActive ? '授業中' : '終了'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 座席表エリア - 左側メイン */}
          <div className="lg:col-span-3 space-y-6">
            {/* 座席選択エリア */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🪑 {currentStep === 'discussion' ? '教室の座席表' : '座席選択'}
              </h2>
                <div className="mb-4">
                  <div className="bg-gray-800 text-white py-2 px-4 rounded-lg text-center text-sm mb-4">
                    黒板
                  </div>
                  
                  {/* 教員エリア - 最前列 */}
                  <div className="flex justify-center mb-4">
                    {/* 教員トピックカード（中央配置） */}
                    <div className="bg-purple-100 border-2 border-purple-400 rounded-xl p-3 min-h-[80px] shadow-md max-w-4xl w-full">
                      <div className="flex flex-col h-full">
                        <div className="text-sm font-bold text-purple-800 mb-2 flex items-center justify-center gap-2">
                          👨‍🏫 今日のトピック
                        </div>
                        <div className="text-lg font-bold text-purple-900 mb-1 text-center">
                          {sessionInfo.teacherTopicTitle}
                        </div>
                        {sessionInfo.teacherTopicContent && (
                          <div className="text-sm text-purple-700 leading-tight text-center">
                            {sessionInfo.teacherTopicContent}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {renderSeatGrid()}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded-full border-2 border-gray-300"></div>
                    <span>空席</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-blue-600"></div>
                    <span>着席済み</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-green-600"></div>
                    <span>あなたの席</span>
                  </div>
                </div>
                {selectedSeat && currentStep === 'seat-selection' && (
                  <div className="text-center">
                    <p className="text-gray-700 mb-3">
                      座席 {String.fromCharCode(65 + selectedSeat.row)}-{selectedSeat.col + 1} を選択中
                    </p>
                    <button
                      onClick={confirmSeatSelection}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-medium"
                    >
                      この座席に決定
                    </button>
                  </div>
                )}
              </div>

          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* チャットエリア - 最上部 */}
            <div className="bg-white rounded-xl shadow-lg p-4 h-80 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                💬 みんなの議論
              </h3>
              
              <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-3 mb-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-4">
                    チャットメッセージはまだありません
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-blue-600 text-sm">{msg.sender}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm bg-white rounded-lg p-2 leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              {currentStep === 'discussion' && userInfo ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="メッセージを入力..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 font-semibold placeholder-gray-500"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim()}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 text-sm font-medium"
                  >
                    送信
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm py-2 bg-gray-50 rounded-lg">
                  {currentStep === 'discussion' ? 'ログインが必要です' : 'ディスカッション開始後に利用可能'}
                </div>
              )}
            </div>


          </div>
        </div>
      </div>

      {/* 座席詳細表示モーダル */}
      {showDetailModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* モーダルヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {selectedParticipant.studentName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedParticipant.studentName}</h2>
                    <p className="text-sm text-gray-600">
                      座席: {selectedParticipant.seatPosition ? 
                        `${String.fromCharCode(65 + selectedParticipant.seatPosition.row)}-${selectedParticipant.seatPosition.col + 1}` : 
                        '未着席'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* トピック内容 */}
            <div className="p-6">
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-blue-900 mb-3">{selectedParticipant.topicTitle}</h3>
                {selectedParticipant.topicContent && (
                  <p className="text-blue-800 leading-relaxed">{selectedParticipant.topicContent}</p>
                )}
              </div>

              {/* いいねとコメント統計 */}
              <div className="flex items-center gap-6 mb-6">
                <button
                  onClick={() => handleLike(selectedParticipant.studentName)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    likes[selectedParticipant.studentName]?.liked
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <span className="text-xl">{likes[selectedParticipant.studentName]?.liked ? '❤️' : '🤍'}</span>
                  <span className="font-medium">
                    {likes[selectedParticipant.studentName]?.count || 0}
                  </span>
                </button>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-lg">💬</span>
                  <span>{comments[selectedParticipant.studentName]?.length || 0} コメント</span>
                </div>
              </div>

              {/* コメント一覧 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">コメント</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {(comments[selectedParticipant.studentName] || []).map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                  {(!comments[selectedParticipant.studentName] || comments[selectedParticipant.studentName].length === 0) && (
                    <p className="text-gray-500 text-center py-4">まだコメントがありません</p>
                  )}
                </div>
              </div>

              {/* コメント入力 */}
              {userInfo && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="コメントを追加..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-semibold placeholder-gray-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(selectedParticipant.studentName)}
                    />
                    <button
                      onClick={() => handleAddComment(selectedParticipant.studentName)}
                      disabled={!commentInput.trim()}
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-medium transition-colors"
                    >
                      投稿
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}