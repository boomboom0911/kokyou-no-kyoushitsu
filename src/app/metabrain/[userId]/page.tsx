'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import MetabrainVisualization from '@/components/MetabrainVisualization'
import { 
  getPersonalLearningNetwork, 
  transformToVisualizationData,
  addNewTopicCard,
  MetabrainNode,
  MetabrainVisualizationData,
  PersonalLearningData
} from '@/lib/metabrain-api'

export default function MetabrainPage() {
  const params = useParams()
  const userId = typeof params?.userId === 'string' ? params.userId : Array.isArray(params?.userId) ? params.userId[0] : ''
  
  const [userName, setUserName] = useState('')
  const [learningData, setLearningData] = useState<PersonalLearningData[]>([])
  const [visualizationData, setVisualizationData] = useState<MetabrainVisualizationData>({
    nodes: [],
    edges: [],
    stats: {
      totalNodes: 0,
      totalConnections: 0,
      ownTopics: 0,
      likedTopics: 0,
      commentedTopics: 0,
      viewedSessions: 0
    }
  })
  const [selectedNode, setSelectedNode] = useState<MetabrainNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(2024)
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all')
  
  // 新カード追加モーダル
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newTopicContent, setNewTopicContent] = useState('')
  const [isAddingCard, setIsAddingCard] = useState(false)

  // 初期化：ユーザー名設定とデータ取得
  useEffect(() => {
    if (userId) {
      const decodedUserName = decodeURIComponent(userId)
      setUserName(decodedUserName)
      loadLearningData(decodedUserName)
    }
  }, [userId])

  // 学習データの取得
  const loadLearningData = async (userName: string, options?: { year?: number; semester?: number }) => {
    setIsLoading(true)
    try {
      const data = await getPersonalLearningNetwork(userName, options)
      setLearningData(data)
      
      const visualData = transformToVisualizationData(data)
      setVisualizationData(visualData)
    } catch (error) {
      console.error('Error loading learning data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // フィルター変更時の再読み込み
  useEffect(() => {
    if (userName) {
      const options = selectedSemester !== 'all' ? {
        year: selectedYear,
        semester: selectedSemester as number
      } : { year: selectedYear }
      
      loadLearningData(userName, options)
    }
  }, [selectedYear, selectedSemester, userName])

  // 新しいトピックカード追加
  const handleAddNewCard = async () => {
    if (!newTopicTitle.trim()) return

    setIsAddingCard(true)
    try {
      const success = await addNewTopicCard(userName, newTopicTitle, newTopicContent)
      if (success) {
        setNewTopicTitle('')
        setNewTopicContent('')
        setShowAddModal(false)
        // データを再読み込み
        await loadLearningData(userName)
      } else {
        alert('カードの追加に失敗しました')
      }
    } catch (error) {
      console.error('Error adding new card:', error)
      alert('カードの追加中にエラーが発生しました')
    } finally {
      setIsAddingCard(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
      {/* ヘッダー - 宇宙ステーション風 */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-blue-400/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🧠</div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {userName}さんのメタブレイン
                </h1>
                <p className="text-blue-300 text-sm">
                  あなたの知識の星座とつながりを探索しましょう
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* 時空フィルター */}
              <div className="flex items-center gap-2">
                <label className="text-white text-sm">📅</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-slate-700 text-white px-3 py-1 rounded border border-blue-400/30 text-sm"
                >
                  <option value={2024}>2024年度</option>
                  <option value={2023}>2023年度</option>
                </select>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="bg-slate-700 text-white px-3 py-1 rounded border border-blue-400/30 text-sm"
                >
                  <option value="all">全期間</option>
                  <option value={1}>1学期</option>
                  <option value={2}>2学期</option>
                  <option value={3}>3学期</option>
                </select>
              </div>

              {/* データ探査ボタン */}
              <button
                onClick={() => loadLearningData(userName)}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                🚀 データ探査
              </button>

              {/* メタバース教室に戻る */}
              <a
                href="/metaverse"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                🌐 メタバース教室
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          {/* メタブレイン可視化エリア (80%) */}
          <div className="flex-1 relative">
            <div className="h-full bg-slate-800/20 backdrop-blur-sm border border-blue-400/20 rounded-xl overflow-hidden">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4 animate-pulse">🧠</div>
                    <div className="text-xl mb-2">メタブレインを構築中...</div>
                    <div className="text-sm opacity-60">
                      {userName}さんの学習の軌跡を読み込んでいます
                    </div>
                  </div>
                </div>
              ) : (
                <MetabrainVisualization
                  data={visualizationData}
                  onNodeSelect={setSelectedNode}
                  className="h-full"
                />
              )}
            </div>

            {/* フローティング新星生成ボタン */}
            <button
              onClick={() => setShowAddModal(true)}
              className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black rounded-full shadow-lg shadow-yellow-500/50 text-2xl font-bold transition-all transform hover:scale-110 hover:rotate-12"
              title="新しい星（トピック）を生成"
            >
              ✨
            </button>
          </div>

          {/* 詳細パネル (20%) */}
          <div className="w-80 space-y-4">
            {/* 選択中トピック詳細 */}
            <div className="bg-slate-800/80 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                📊 選択中の星座
              </h3>
              
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg border-l-4 border-yellow-400">
                    <div className="text-sm opacity-75 mb-2">
                      {selectedNode.type === 'own' && '🌟 あなたの恒星'}
                      {selectedNode.type === 'liked' && '💎 共感の星'}
                      {selectedNode.type === 'commented' && '🔮 対話の星'}
                      {selectedNode.type === 'viewed' && '⚪ 探索の星'}
                    </div>
                    <h4 className="font-medium mb-2">{selectedNode.label}</h4>
                    {selectedNode.content && (
                      <p className="text-sm opacity-80 leading-relaxed">
                        {selectedNode.content}
                      </p>
                    )}
                    {selectedNode.className && selectedNode.date && (
                      <div className="text-xs opacity-60 mt-3 pt-2 border-t border-slate-600">
                        📍 {selectedNode.className} • {selectedNode.date}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 opacity-60">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-sm">
                    星座をクリックして<br />
                    詳細を表示
                  </p>
                </div>
              )}
            </div>

            {/* 学習の軌跡 */}
            <div className="bg-slate-800/80 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🛸 学習の軌跡
              </h3>
              
              <div className="space-y-3">
                {learningData.slice(0, 5).map((data, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-sm font-medium mb-1">
                      {data.own_topic || data.teacher_topic_title}
                    </div>
                    <div className="text-xs opacity-60">
                      {data.class_name} • {data.date}
                    </div>
                  </div>
                ))}
                
                {learningData.length === 0 && (
                  <div className="text-center py-4 opacity-60">
                    <div className="text-2xl mb-2">🌱</div>
                    <p className="text-sm">
                      まだ軌跡がありません<br />
                      授業に参加して星座を作りましょう
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 新星生成モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-blue-400/30 rounded-xl p-6 w-full max-w-md text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                ✨ 新しい星を生成
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  星の名前（トピック）
                </label>
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="例：持続可能な社会について"
                  maxLength={100}
                  className="w-full px-3 py-2 bg-slate-700 border border-blue-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  disabled={isAddingCard}
                />
                <div className="text-xs opacity-60 mt-1 text-right">
                  {newTopicTitle.length}/100
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  星の輝き（詳細）
                </label>
                <textarea
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  placeholder="あなたの考えや気づきを記録してください"
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 bg-slate-700 border border-purple-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-white"
                  disabled={isAddingCard}
                />
                <div className="text-xs opacity-60 mt-1 text-right">
                  {newTopicContent.length}/500
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={isAddingCard}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddNewCard}
                  disabled={isAddingCard || !newTopicTitle.trim()}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-500 disabled:to-gray-600 rounded-lg text-sm font-medium transition-colors text-black"
                >
                  {isAddingCard ? '生成中...' : '🌟 星を生成'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}