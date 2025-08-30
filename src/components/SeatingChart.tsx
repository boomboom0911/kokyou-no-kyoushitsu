'use client'

import React, { useState, useEffect } from 'react'
import { ParticipantData, CommentData } from '@/lib/auth'
import TopicDetailPopup from './TopicDetailPopup'

interface SeatingChartProps {
  sessionId: string
  participants: ParticipantData[]
  comments: CommentData[]
  onSeatSelect?: (seatPosition: number) => void
  onLike?: (participantId: string) => void
  onComment?: (participantId: string, comment: string) => void
  teacherCard?: {
    title: string
    content: string
    date: string
    className: string
  }
  currentUser?: {
    name: string
    id: string
  }
}

export default function SeatingChart({ 
  sessionId, 
  participants, 
  comments,
  onSeatSelect,
  onLike,
  onComment,
  teacherCard,
  currentUser 
}: SeatingChartProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null)
  const [showDetailPopup, setShowDetailPopup] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantData | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

  // 座席配置の設定（6×7 = 42席）
  const GRID_COLS = 6
  const GRID_ROWS = 7
  const TOTAL_SEATS = 42

  // 参加者を座席位置別に整理
  const getParticipantBySeat = (seatPosition: number): ParticipantData | null => {
    return participants.find(p => p.seatPosition === seatPosition) || null
  }

  // 座席クリック処理
  const handleSeatClick = (seatPosition: number, event: React.MouseEvent) => {
    const participant = getParticipantBySeat(seatPosition)
    
    if (participant) {
      // 参加者がいる場合：詳細ポップアップを表示
      setSelectedParticipant(participant)
      setPopupPosition({ x: event.clientX, y: event.clientY })
      setShowDetailPopup(true)
    } else if (onSeatSelect) {
      // 空席の場合：座席選択
      setSelectedSeat(seatPosition)
      onSeatSelect(seatPosition)
    }
  }

  // ポップアップを閉じる
  const handleClosePopup = () => {
    setShowDetailPopup(false)
    setSelectedParticipant(null)
  }

  // 座席のスタイルを取得
  const getSeatStyle = (seatPosition: number): string => {
    const participant = getParticipantBySeat(seatPosition)
    const isOccupied = !!participant
    const isHovered = hoveredSeat === seatPosition
    const isSelected = selectedSeat === seatPosition

    let baseClass = `
      relative min-h-[70px] sm:min-h-[80px] lg:min-h-[85px] p-2 sm:p-3 rounded-xl cursor-pointer
      flex flex-col items-center justify-center text-center text-xs
      transition-all duration-200 transform shadow-md
      border-2
    `

    if (isOccupied) {
      baseClass += ` 
        bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 
        border-emerald-400 text-emerald-800 
        ring-1 ring-emerald-200
      `
    } else {
      baseClass += ` 
        bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50
        border-dashed border-slate-300 text-slate-500
      `
    }

    if (isSelected) {
      baseClass += ` ring-4 ring-blue-400 ring-offset-2`
    }

    if (isHovered) {
      if (!isOccupied) {
        baseClass += ` scale-[2.5] shadow-2xl bg-gradient-to-br from-blue-100 to-purple-100 border-blue-500 border-solid text-blue-900 z-50`
      } else {
        baseClass += ` scale-[2] shadow-2xl ring-4 ring-emerald-400 z-50`
      }
    }

    return baseClass
  }

  // 座席内容を取得
  const getSeatContent = (seatPosition: number) => {
    const participant = getParticipantBySeat(seatPosition)
    
    if (participant) {
      return (
        <div className="w-full">
          {/* 座席番号（小さく右上） */}
          <div className="absolute top-1 right-1 text-[8px] text-emerald-600 font-mono bg-emerald-100 px-1 rounded">
            #{seatPosition}
          </div>
          
          {/* 学生名 */}
          <div className="font-bold text-emerald-800 mb-1 text-sm leading-tight">
            🎓 {participant.studentName}
          </div>
          
          {/* トピックタイトル */}
          {participant.topicTitle && (
            <div className="text-emerald-700 text-[10px] font-medium mb-1 truncate max-w-full">
              📝 {participant.topicTitle}
            </div>
          )}
          
          {/* 反応バッジ */}
          {participant.topicContent && (
            <div className="flex gap-1 justify-center">
              {typeof participant.commentCount === 'number' && (
                <span className="text-[8px] bg-gradient-to-r from-blue-200 to-cyan-200 text-blue-800 px-1.5 py-0.5 rounded-full shadow-sm font-bold">
                  💬{participant.commentCount}
                </span>
              )}
              {typeof participant.likeCount === 'number' && (
                <span className="text-[8px] bg-gradient-to-r from-rose-200 to-pink-200 text-rose-800 px-1.5 py-0.5 rounded-full shadow-sm font-bold">
                  👍{participant.likeCount}
                </span>
              )}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="w-full relative">
        {/* 座席番号（中央大きく） */}
        <div className="absolute top-1 right-1 text-[8px] text-slate-400 font-mono">
          #{seatPosition}
        </div>
        
        {/* 空席表示 */}
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-2xl mb-1 opacity-50">🪑</div>
          <div className="text-slate-400 text-[10px] font-medium">空席</div>
          <div className="text-slate-300 text-[8px] mt-1">クリックして着席</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full p-4">
      {/* 座席表グリッド */}
      <div className="w-full max-w-4xl mx-auto">
        {/* 教卓エリア（最前列） */}
        <div className="mb-4">
          <div className="grid grid-cols-6 gap-2 mb-2">
            {/* 教卓カード */}
            <div className="col-span-1 bg-orange-100 border-2 border-orange-400 rounded-lg p-2 min-h-[60px] flex items-center justify-center">
              <div className="text-orange-700 font-semibold text-xs text-center">
                教卓
              </div>
            </div>
            
            {/* 教員カード */}
            <div className="col-span-5 bg-purple-100 border-2 border-purple-400 rounded-lg p-3 min-h-[60px]">
              <div className="text-purple-700">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-sm">
                    {teacherCard?.date} - {teacherCard?.className}
                  </div>
                  <div className="text-xs opacity-70">👨‍🏫先生</div>
                </div>
                {teacherCard?.title && (
                  <div className="text-xs font-medium mb-1">{teacherCard.title}</div>
                )}
                {teacherCard?.content && (
                  <div className="text-xs opacity-80 truncate">{teacherCard.content}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 生徒座席グリッド（6×7） */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 p-2 sm:p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border-2 border-slate-200 shadow-inner">
          {/* 列ラベル */}
          <div className="col-span-3 sm:col-span-4 lg:col-span-6 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 mb-2">
            {['A', 'B', 'C', 'D', 'E', 'F'].map((label, index) => (
              <div key={label} className="text-center text-xs font-bold text-slate-600 bg-slate-200 py-1 rounded-lg">
                <span className="hidden sm:inline">{label}列</span>
                <span className="sm:hidden">{label}</span>
              </div>
            ))}
          </div>
          
          {Array.from({ length: TOTAL_SEATS }, (_, index) => {
            const seatPosition = index + 1
            const row = Math.floor(index / 6) + 1
            const col = (index % 6) + 1
            
            return (
              <div key={seatPosition} className="relative">
                {/* 行ラベル（左端のみ） */}
                {col === 1 && (
                  <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-xs font-bold text-slate-600 bg-slate-200 w-6 h-6 rounded-full flex items-center justify-center">
                    {row}
                  </div>
                )}
                
                <div
                  className={getSeatStyle(seatPosition)}
                  onClick={(e) => handleSeatClick(seatPosition, e)}
                  onMouseEnter={() => setHoveredSeat(seatPosition)}
                  onMouseLeave={() => setHoveredSeat(null)}
                >
                  {getSeatContent(seatPosition)}
                </div>
              </div>
            )
          })}
        </div>

        {/* 未提出者リスト */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm font-medium text-yellow-800 mb-2">
            未提出者：
          </div>
          <div className="text-xs text-yellow-700">
            {participants
              .filter(p => !p.topicTitle)
              .map(p => p.studentName)
              .join('、') || '全員提出済み'}
          </div>
        </div>

        {/* 座席表統計 */}
        <div className="mt-2 flex justify-between text-xs text-gray-600">
          <span>参加者: {participants.length}/42</span>
          <span>提出済み: {participants.filter(p => p.topicTitle).length}人</span>
        </div>

      </div>

      {/* トピック詳細ポップアップ */}
      {showDetailPopup && selectedParticipant && (
        <TopicDetailPopup
          participant={{
            studentName: selectedParticipant.studentName,
            topicTitle: selectedParticipant.topicTitle,
            topicContent: selectedParticipant.topicContent,
            id: selectedParticipant.id,
            likeCount: selectedParticipant.likeCount,
            commentCount: selectedParticipant.commentCount
          }}
          position={popupPosition}
          onClose={handleClosePopup}
          onLike={onLike}
          onComment={onComment}
          comments={comments.filter(c => c.participantId === selectedParticipant.id)}
        />
      )}
    </div>
  )
}