'use client'

import React from 'react'
import { CommentData } from '@/lib/auth'

interface TopicDetailPopupProps {
  participant: {
    studentName: string
    topicTitle: string | null
    topicContent: string | null
    id: string
    likeCount?: number
    commentCount?: number
  }
  position: {
    x: number
    y: number
  }
  onClose: () => void
  onLike?: (participantId: string) => void
  onComment?: (participantId: string, comment: string) => void
  comments: CommentData[]
}

export default function TopicDetailPopup({ 
  participant, 
  position, 
  onClose, 
  onLike, 
  onComment,
  comments 
}: TopicDetailPopupProps) {
  const [comment, setComment] = React.useState('')
  const [showCommentInput, setShowCommentInput] = React.useState(false)

  // ポップアップの位置調整（画面端での表示調整）
  const popupStyle = {
    position: 'fixed' as const,
    left: Math.min(position.x, window.innerWidth - 400),
    top: Math.min(position.y, window.innerHeight - 300),
    zIndex: 1000
  }

  const handleLike = () => {
    if (onLike) {
      onLike(participant.id)
    }
  }

  const handleCommentSubmit = () => {
    if (comment.trim() && onComment) {
      onComment(participant.id, comment.trim())
      setComment('')
      setShowCommentInput(false)
    }
  }

  // 背景クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!participant.topicTitle) {
    return (
      <div 
        className="fixed inset-0 z-50" 
        onClick={handleBackdropClick}
      >
        <div 
          style={popupStyle}
          className="bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 max-w-xs"
        >
          <div className="text-center">
            <div className="text-gray-500 text-sm">
              📝 {participant.studentName}さんは<br />まだトピックを提出していません
            </div>
            <button
              onClick={onClose}
              className="mt-3 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 z-50" 
      onClick={handleBackdropClick}
    >
      <div 
        style={popupStyle}
        className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-xl shadow-2xl p-5 max-w-md transform scale-100 animate-in"
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="text-blue-600">🎓</div>
            <div className="font-semibold text-blue-800 text-sm">
              {participant.studentName}さんのトピック
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-semibold"
          >
            ✕
          </button>
        </div>

        {/* タイトル */}
        <h3 className="text-lg font-bold text-gray-800 mb-3 leading-tight">
          {participant.topicTitle}
        </h3>

        {/* 内容 */}
        {participant.topicContent && (
          <div className="text-sm text-gray-700 mb-4 leading-relaxed max-h-32 overflow-y-auto">
            {participant.topicContent}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-medium hover:bg-red-200 transition-colors"
          >
            👍 いいね <span className="text-red-500">({participant.likeCount || 0})</span>
          </button>
          <button
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-600 rounded-full text-xs font-medium hover:bg-green-200 transition-colors"
          >
            💬 コメント <span className="text-green-500">({participant.commentCount || 0})</span>
          </button>
        </div>

        {/* 既存のコメント */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3 max-h-24 overflow-y-auto">
          <div className="text-xs space-y-2">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id}>
                  <span className="font-medium text-gray-700">{comment.senderName}:</span>
                  <span className="text-gray-600 ml-1">{comment.content}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-2">
                まだコメントがありません
              </div>
            )}
          </div>
        </div>

        {/* コメント入力 */}
        {showCommentInput && (
          <div className="border-t pt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="コメントを入力..."
                maxLength={100}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
              />
              <button
                onClick={handleCommentSubmit}
                disabled={!comment.trim()}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                送信
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {comment.length}/100
            </div>
          </div>
        )}
      </div>
    </div>
  )
}