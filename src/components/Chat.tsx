'use client'

import React, { useState, useEffect, useRef } from 'react'

interface ChatMessage {
  id: string
  senderName: string
  message: string
  isTeacher: boolean
  createdAt: string
}

interface ChatProps {
  sessionId: string
  currentUser: {
    name: string
    isTeacher?: boolean
  }
  messages: ChatMessage[]
  onSendMessage?: (message: string) => Promise<void>
}

export default function Chat({ sessionId, currentUser, messages, onSendMessage }: ChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自動スクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // メッセージ送信処理
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || isLoading) return

    try {
      setIsLoading(true)
      if (onSendMessage) {
        await onSendMessage(newMessage.trim())
      }
      setNewMessage('')
    } catch (error) {
      console.error('Message send error:', error)
      alert('メッセージの送信に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 時刻フォーマット
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-teal-50 to-slate-100 border-2 border-teal-200 rounded-lg shadow-lg">
      {/* チャットヘッダー */}
      <div className="p-3 border-b border-teal-200 bg-gradient-to-r from-teal-100 to-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-teal-800 text-sm">
              💬 クラス全体チャット
            </h3>
            <div className="text-xs text-teal-600 mt-1">
              {messages.length}件のメッセージ
            </div>
          </div>
          <div className="text-xs text-teal-700 bg-teal-200 px-2 py-1 rounded-full">
            {currentUser.isTeacher ? '👨‍🏫先生' : '🎓' + currentUser.name}
          </div>
        </div>
      </div>

      {/* メッセージリスト */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-8">
            <div className="mb-3 text-4xl">💬</div>
            <div className="font-medium mb-1">まだメッセージがありません</div>
            <div className="text-xs">クラス全体で議論を始めましょう！</div>
            <div className="text-xs text-teal-600 mt-2 bg-teal-50 p-2 rounded-lg inline-block">
              💡 質問や意見を気軽に投稿してください
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderName === currentUser.name ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  message.isTeacher
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-200'
                    : message.senderName === currentUser.name
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200'
                    : 'bg-white border-2 border-gray-100 text-gray-800 shadow-gray-100'
                }`}
              >
                {message.isTeacher && (
                  <div className="flex items-center gap-1 mb-2 text-purple-100 text-xs font-medium">
                    <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                      👨‍🏫 先生からのメッセージ
                    </span>
                  </div>
                )}
                <div className={`text-xs mb-1 flex items-center justify-between ${
                  message.isTeacher
                    ? 'text-purple-100'
                    : message.senderName === currentUser.name
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}>
                  <span className="font-medium">
                    {!message.isTeacher && (message.senderName === currentUser.name ? 'あなた' : message.senderName)}
                  </span>
                  <span className="ml-2">{formatTime(message.createdAt)}</span>
                </div>
                <div className="break-words leading-relaxed">
                  {message.message}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力フォーム */}
      <div className="p-3 border-t border-teal-200 bg-gradient-to-r from-white to-teal-50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={currentUser.isTeacher ? "クラスにメッセージを送信..." : "質問や意見を投稿..."}
            maxLength={200}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border-2 border-teal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 bg-white shadow-sm text-gray-900"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isLoading ? '送信中...' : '💬 送信'}
          </button>
        </form>
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-teal-600">
            💡 みんなで活発に議論しましょう
          </div>
          <div className="text-xs text-gray-500">
            {newMessage.length}/200
          </div>
        </div>
      </div>
    </div>
  )
}