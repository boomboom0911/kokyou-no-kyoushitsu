'use client'

import React from 'react'
import MainClassroom from '@/components/MainClassroom'

export default function DemoPage() {
  // デモ用のセッションデータ
  const mockSessionData = {
    id: 'demo-session-123',
    className: '3年1組',
    date: '2024-01-15',
    period: 3,
    teacherTopicTitle: '民主主義と政治参加',
    teacherTopicContent: '今日は若者の政治離れについて、みんなで考えてみましょう。なぜ若い人たちは政治に関心を持ちにくいのか、どうすれば参加しやすくなるのか、自分たちの意見を共有してください。'
  }

  // デモ用の現在ユーザー
  const mockCurrentUser = {
    name: 'あなた',
    id: 'demo-user',
    isTeacher: false
  }

  return (
    <div>
      <MainClassroom
        sessionId={mockSessionData.id}
        sessionData={mockSessionData}
        currentUser={mockCurrentUser}
      />
    </div>
  )
}