'use client'

import React, { useState } from 'react'

interface QuickPollOption {
  id: string
  text: string
  votes: number
}

interface QuickPoll {
  id: string
  question: string
  options: QuickPollOption[]
  isActive: boolean
  totalVotes: number
  createdAt: string
}

interface TeacherQuickToolsProps {
  sessionCode: string
  onCreatePoll: (poll: Omit<QuickPoll, 'id' | 'createdAt'>) => void
  onClosePoll: (pollId: string) => void
  onSendAnnouncement: (message: string, type: 'info' | 'warning' | 'success') => void
  onManageGroups: (action: 'shuffle' | 'reset' | 'lock') => void
  onManageSession: (action: 'pause' | 'resume' | 'extend' | 'close') => void
}

export default function TeacherQuickTools({
  sessionCode,
  onCreatePoll,
  onClosePoll,
  onSendAnnouncement,
  onManageGroups,
  onManageSession
}: TeacherQuickToolsProps) {
  const [activeTab, setActiveTab] = useState<'poll' | 'announce' | 'groups' | 'session'>('poll')
  const [polls, setPolls] = useState<QuickPoll[]>([])
  
  // 投票作成関連
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [pollType, setPollType] = useState<'multiple' | 'single'>('single')

  // お知らせ関連
  const [announcementText, setAnnouncementText] = useState('')
  const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'success'>('info')

  // 投票作成
  const handleCreatePoll = () => {
    if (!pollQuestion.trim() || pollOptions.some(opt => !opt.trim())) {
      alert('質問と全ての選択肢を入力してください')
      return
    }

    const newPoll: Omit<QuickPoll, 'id' | 'createdAt'> = {
      question: pollQuestion.trim(),
      options: pollOptions.map((text, index) => ({
        id: `option_${index}`,
        text: text.trim(),
        votes: 0
      })),
      isActive: true,
      totalVotes: 0
    }

    onCreatePoll(newPoll)
    
    // フォームリセット
    setPollQuestion('')
    setPollOptions(['', ''])
  }

  // お知らせ送信
  const handleSendAnnouncement = () => {
    if (!announcementText.trim()) {
      alert('お知らせ内容を入力してください')
      return
    }

    onSendAnnouncement(announcementText.trim(), announcementType)
    setAnnouncementText('')
  }

  // 投票選択肢追加
  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ''])
    }
  }

  // 投票選択肢削除
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index))
    }
  }

  const tabs = [
    { id: 'poll', label: '📊 投票', icon: '📊' },
    { id: 'announce', label: '📢 お知らせ', icon: '📢' },
    { id: 'groups', label: '👥 グループ', icon: '👥' },
    { id: 'session', label: '⚙️ セッション', icon: '⚙️' }
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      {/* タブヘッダー */}
      <div className="border-b">
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            教室管理ツール
          </h2>
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="p-6">
        {/* 投票タブ */}
        {activeTab === 'poll' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">
                クイック投票作成
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    質問
                  </label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="例：今日の授業で一番印象に残ったことは？"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選択肢
                  </label>
                  <div className="space-y-2">
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 w-8">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...pollOptions]
                            newOptions[index] = e.target.value
                            setPollOptions(newOptions)
                          }}
                          placeholder={`選択肢 ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            onClick={() => removePollOption(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {pollOptions.length < 6 && (
                    <button
                      onClick={addPollOption}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      + 選択肢を追加
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleCreatePoll}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    投票を開始
                  </button>
                  <button
                    onClick={() => {
                      setPollQuestion('')
                      setPollOptions(['', ''])
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    クリア
                  </button>
                </div>
              </div>
            </div>

            {/* アクティブな投票リスト */}
            {polls.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  進行中の投票
                </h3>
                <div className="space-y-3">
                  {polls.filter(poll => poll.isActive).map(poll => (
                    <div key={poll.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {poll.question}
                        </h4>
                        <button
                          onClick={() => onClosePoll(poll.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200"
                        >
                          投票終了
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        総投票数: {poll.totalVotes} 票
                      </div>
                      <div className="mt-2 space-y-1">
                        {poll.options.map(option => (
                          <div key={option.id} className="flex items-center justify-between">
                            <span className="text-sm">{option.text}</span>
                            <span className="text-sm font-medium">{option.votes} 票</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* お知らせタブ */}
        {activeTab === 'announce' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">
                全体お知らせ送信
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お知らせ内容
                  </label>
                  <textarea
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="例：残り10分で議論終了です。まとめに入ってください。"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お知らせタイプ
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="info"
                        checked={announcementType === 'info'}
                        onChange={(e) => setAnnouncementType(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">📘 情報</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="warning"
                        checked={announcementType === 'warning'}
                        onChange={(e) => setAnnouncementType(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">⚠️ 注意</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="success"
                        checked={announcementType === 'success'}
                        onChange={(e) => setAnnouncementType(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">✅ 完了</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSendAnnouncement}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  お知らせ送信
                </button>
              </div>
            </div>

            {/* 定型お知らせボタン */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">
                定型お知らせ
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onSendAnnouncement('議論開始です。積極的に意見交換をしてください。', 'info')}
                  className="p-3 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-left"
                >
                  🚀 議論開始
                </button>
                <button
                  onClick={() => onSendAnnouncement('残り10分です。議論をまとめてください。', 'warning')}
                  className="p-3 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 text-left"
                >
                  ⏰ 時間告知
                </button>
                <button
                  onClick={() => onSendAnnouncement('素晴らしい議論でした！発表準備をお願いします。', 'success')}
                  className="p-3 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-left"
                >
                  🎉 発表準備
                </button>
                <button
                  onClick={() => onSendAnnouncement('みなさんの発言をもう少し聞きたいです。', 'info')}
                  className="p-3 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-left"
                >
                  🗣️ 発言促進
                </button>
              </div>
            </div>
          </div>
        )}

        {/* グループ管理タブ */}
        {activeTab === 'groups' && (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">
              グループ・座席管理
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onManageGroups('shuffle')}
                className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left"
              >
                <div className="text-lg mb-1">🔄</div>
                <div className="font-medium">座席シャッフル</div>
                <div className="text-sm opacity-75">ランダムに座席を再配置</div>
              </button>
              
              <button
                onClick={() => onManageGroups('reset')}
                className="p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <div className="text-lg mb-1">🔄</div>
                <div className="font-medium">座席リセット</div>
                <div className="text-sm opacity-75">全員の座席選択を解除</div>
              </button>
              
              <button
                onClick={() => onManageGroups('lock')}
                className="p-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-left"
              >
                <div className="text-lg mb-1">🔒</div>
                <div className="font-medium">座席固定</div>
                <div className="text-sm opacity-75">座席変更を禁止</div>
              </button>
              
              <button
                onClick={() => onManageGroups('reset')}
                className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <div className="text-lg mb-1">🔓</div>
                <div className="font-medium">座席解放</div>
                <div className="text-sm opacity-75">座席変更を許可</div>
              </button>
            </div>
          </div>
        )}

        {/* セッション管理タブ */}
        {activeTab === 'session' && (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">
              セッション制御
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onManageSession('pause')}
                className="p-4 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-left"
              >
                <div className="text-lg mb-1">⏸️</div>
                <div className="font-medium">セッション一時停止</div>
                <div className="text-sm opacity-75">議論を一時的に停止</div>
              </button>
              
              <button
                onClick={() => onManageSession('resume')}
                className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <div className="text-lg mb-1">▶️</div>
                <div className="font-medium">セッション再開</div>
                <div className="text-sm opacity-75">議論を再開</div>
              </button>
              
              <button
                onClick={() => onManageSession('extend')}
                className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <div className="text-lg mb-1">⏰</div>
                <div className="font-medium">時間延長</div>
                <div className="text-sm opacity-75">セッションを15分延長</div>
              </button>
              
              <button
                onClick={() => {
                  if (confirm('セッションを終了しますか？この操作は取り消せません。')) {
                    onManageSession('close')
                  }
                }}
                className="p-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-left"
              >
                <div className="text-lg mb-1">🛑</div>
                <div className="font-medium">セッション終了</div>
                <div className="text-sm opacity-75">授業を完全に終了</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}