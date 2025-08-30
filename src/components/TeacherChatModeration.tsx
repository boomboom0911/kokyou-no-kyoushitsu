'use client'

import React, { useState, useEffect } from 'react'

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

interface TeacherChatModerationProps {
  sessionId: string
  messages: ChatMessage[]
  onMessageFlag: (messageId: string, reason: string) => void
  onMessageApprove: (messageId: string) => void
  onMessageHide: (messageId: string) => void
}

export default function TeacherChatModeration({
  sessionId,
  messages,
  onMessageFlag,
  onMessageApprove,
  onMessageHide
}: TeacherChatModerationProps) {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'recent' | 'keywords'>('recent')
  const [keywordAlert, setKeywordAlert] = useState<string[]>([])
  const [autoModeration, setAutoModeration] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null)

  // 自動フラグキーワード
  const flagKeywords = [
    '馬鹿', 'バカ', 'アホ', '死ね', 'きもい', '消えろ', 'うざい', 
    '関係ない', '意味ない', 'つまらない', '嫌い'
  ]

  // メッセージの自動チェック
  useEffect(() => {
    if (!autoModeration) return

    messages.forEach(message => {
      const containsFlag = flagKeywords.some(keyword => 
        message.message.toLowerCase().includes(keyword)
      )
      
      if (containsFlag && !message.flagged) {
        const detectedKeyword = flagKeywords.find(keyword => 
          message.message.toLowerCase().includes(keyword)
        )
        onMessageFlag(message.id, `自動検出: "${detectedKeyword}" を含む`)
      }
    })
  }, [messages, autoModeration])

  // フィルタリングされたメッセージ
  const filteredMessages = messages.filter(message => {
    switch (filter) {
      case 'flagged':
        return message.flagged && !message.moderated
      case 'recent':
        return new Date(message.created_at).getTime() > Date.now() - (10 * 60 * 1000) // 直近10分
      case 'keywords':
        return flagKeywords.some(keyword => 
          message.message.toLowerCase().includes(keyword)
        )
      default:
        return true
    }
  })

  // メッセージリスクレベル判定
  const getMessageRiskLevel = (message: ChatMessage) => {
    if (message.flagged) return 'high'
    
    const riskWords = ['難しい', 'わからない', '間違い', '違う']
    const hasRiskWord = riskWords.some(word => message.message.includes(word))
    
    if (hasRiskWord) return 'medium'
    return 'low'
  }

  // リスクレベルの色
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'border-red-300 bg-red-50'
      case 'medium': return 'border-yellow-300 bg-yellow-50'
      default: return 'border-gray-200 bg-white'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            チャット監視・管理
          </h2>
          <div className="flex items-center gap-4">
            {/* 自動監視トグル */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoModeration}
                onChange={(e) => setAutoModeration(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">自動監視</span>
            </label>
            
            {/* フィルタ選択 */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="recent">最新 (10分以内)</option>
              <option value="all">すべて</option>
              <option value="flagged">要注意</option>
              <option value="keywords">キーワード検出</option>
            </select>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="px-6 py-3 bg-gray-50 border-b">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-gray-500">総メッセージ:</span>
              <span className="ml-1 font-medium">{messages.length}</span>
            </div>
            <div>
              <span className="text-gray-500">要注意:</span>
              <span className="ml-1 font-medium text-red-600">
                {messages.filter(m => m.flagged && !m.moderated).length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">処理済み:</span>
              <span className="ml-1 font-medium text-green-600">
                {messages.filter(m => m.moderated).length}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {filteredMessages.length} 件表示中
          </div>
        </div>
      </div>

      {/* メッセージリスト */}
      <div className="max-h-96 overflow-y-auto">
        <div className="p-4 space-y-3">
          {filteredMessages.map(message => {
            const riskLevel = getMessageRiskLevel(message)
            return (
              <div
                key={message.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${getRiskColor(riskLevel)} ${
                  selectedMessage?.id === message.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">
                      {message.sender_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleTimeString('ja-JP')}
                    </span>
                    {message.flagged && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        ⚠️ 要注意
                      </span>
                    )}
                    {message.moderated && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        ✅ 処理済み
                      </span>
                    )}
                  </div>
                  
                  {/* 操作ボタン */}
                  <div className="flex items-center gap-2">
                    {!message.moderated && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onMessageFlag(message.id, '手動フラグ')
                          }}
                          className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        >
                          フラグ
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onMessageApprove(message.id)
                          }}
                          className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          承認
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onMessageHide(message.id)
                          }}
                          className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          非表示
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-800 mb-2">
                  {message.message}
                </div>
                
                {message.flag_reason && (
                  <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    理由: {message.flag_reason}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 詳細パネル */}
      {selectedMessage && (
        <div className="border-t bg-gray-50">
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">
              メッセージ詳細
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">送信者:</span>
                  <span className="ml-2">{selectedMessage.sender_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">送信時刻:</span>
                  <span className="ml-2">
                    {new Date(selectedMessage.created_at).toLocaleString('ja-JP')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">リスクレベル:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    getMessageRiskLevel(selectedMessage) === 'high' 
                      ? 'bg-red-100 text-red-800'
                      : getMessageRiskLevel(selectedMessage) === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {getMessageRiskLevel(selectedMessage) === 'high' ? '高' 
                      : getMessageRiskLevel(selectedMessage) === 'medium' ? '中' : '低'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">ステータス:</span>
                  <span className="ml-2">
                    {selectedMessage.moderated 
                      ? '処理済み' 
                      : selectedMessage.flagged 
                      ? '要注意' 
                      : '正常'}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-gray-500">メッセージ内容:</span>
                <div className="mt-1 p-3 bg-white border rounded text-sm">
                  {selectedMessage.message}
                </div>
              </div>
              
              {selectedMessage.flag_reason && (
                <div>
                  <span className="text-gray-500">フラグ理由:</span>
                  <div className="mt-1 text-sm text-red-600">
                    {selectedMessage.flag_reason}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* キーワード管理セクション */}
      <div className="border-t p-4">
        <details className="group">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            自動監視キーワード設定
          </summary>
          <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
            <div className="mb-2 text-gray-600">現在の監視キーワード:</div>
            <div className="flex flex-wrap gap-2">
              {flagKeywords.map(keyword => (
                <span 
                  key={keyword}
                  className="px-2 py-1 bg-red-100 text-red-800 rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}