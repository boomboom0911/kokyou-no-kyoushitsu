'use client'

import React, { useState, useEffect } from 'react'

interface TopicModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TopicSubmissionData) => Promise<void>
  seatPosition: number
  initialData?: {
    title: string
    content: string
  }
  participantName: string
}

interface TopicSubmissionData {
  seatPosition: number
  topicTitle: string
  topicContent: string
}

export default function TopicModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  seatPosition, 
  initialData,
  participantName 
}: TopicModalProps) {
  const [topicTitle, setTopicTitle] = useState('')
  const [topicContent, setTopicContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // モーダルが開かれた時の初期化
  useEffect(() => {
    if (isOpen) {
      setTopicTitle(initialData?.title || '')
      setTopicContent(initialData?.content || '')
    }
  }, [isOpen, initialData])

  // モーダル外クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // 提出処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!topicTitle.trim()) {
      alert('トピックタイトルを入力してください')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        seatPosition,
        topicTitle: topicTitle.trim(),
        topicContent: topicContent.trim()
      })
      onClose()
    } catch (error) {
      console.error('Topic submission error:', error)
      alert('トピックの提出に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                📝 トピック提出
              </h2>
              <p className="text-sm text-gray-600">
                座席 #{seatPosition} - {participantName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* トピックタイトル */}
            <div>
              <label 
                htmlFor="topicTitle" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                トピックタイトル <span className="text-red-500">*</span>
              </label>
              <input
                id="topicTitle"
                type="text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="例：選挙権について"
                maxLength={100}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                required
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {topicTitle.length}/100
              </div>
            </div>

            {/* トピック詳細 */}
            <div>
              <label 
                htmlFor="topicContent" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                詳細内容（任意）
              </label>
              <textarea
                id="topicContent"
                value={topicContent}
                onChange={(e) => setTopicContent(e.target.value)}
                placeholder="トピックについてより詳しく書いてください&#10;例：18歳選挙権の意義と課題について考えてみました。若者の政治参加が重要だと思います。"
                maxLength={500}
                rows={6}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {topicContent.length}/500
              </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <div className="font-semibold mb-1">📋 提出について</div>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>提出後も修正可能です</li>
                  <li>他の生徒にタイトルが表示されます</li>
                  <li>詳細内容はタップ/ホバーで表示されます</li>
                  <li>先生と他の生徒がコメントできます</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!topicTitle.trim() || isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '提出中...' : initialData ? '更新' : '提出'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}