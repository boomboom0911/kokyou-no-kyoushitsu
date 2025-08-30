'use client'

import React, { useState } from 'react'

interface TopicSubmissionModalProps {
  seatPosition: number
  studentName: string
  onSubmit: (topicData: { title: string; content: string }) => void
  onCancel: () => void
}

export default function TopicSubmissionModal({
  seatPosition,
  studentName,
  onSubmit,
  onCancel
}: TopicSubmissionModalProps) {
  const [topicTitle, setTopicTitle] = useState('')
  const [topicContent, setTopicContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!topicTitle.trim()) {
      alert('トピックのタイトルを入力してください')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        title: topicTitle.trim(),
        content: topicContent.trim()
      })
    } catch (error) {
      console.error('Topic submission error:', error)
      alert('トピックの提出に失敗しました')
      setIsSubmitting(false)
    }
  }

  // 背景クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onCancel()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-2xl w-full max-w-lg border-2 border-blue-200">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">📝 トピック提出</h2>
              <p className="text-blue-100 text-sm">
                座席 #{seatPosition} - {studentName}さん
              </p>
            </div>
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-white hover:text-blue-200 text-xl font-semibold disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* トピックタイトル */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              トピックタイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="例：18歳選挙権について"
              maxLength={100}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
              required
              autoFocus
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {topicTitle.length}/100
            </div>
          </div>

          {/* トピック内容 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              トピック詳細（任意）
            </label>
            <textarea
              value={topicContent}
              onChange={(e) => setTopicContent(e.target.value)}
              placeholder="あなたの考えや意見を詳しく書いてください。同級生との議論のきっかけになります。"
              rows={5}
              maxLength={500}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none text-gray-900"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {topicContent.length}/500
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              <div className="font-semibold mb-1">📋 提出について</div>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>提出後、他の生徒があなたのトピックを閲覧できます</li>
                <li>いいねやコメントで交流が生まれます</li>
                <li>提出後の編集はできません</li>
              </ul>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !topicTitle.trim()}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '提出中...' : '📤 トピックを提出する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}