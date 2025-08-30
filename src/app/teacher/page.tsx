'use client'

import React from 'react'
import TeacherDashboard from '@/components/TeacherDashboard'

export default function TeacherPage() {
  const handleSessionCreated = (sessionData: any) => {
    console.log('Session created:', sessionData)
    // 将来的にはここで教室画面への遷移などを実装
  }

  return (
    <TeacherDashboard onSessionCreated={handleSessionCreated} />
  )
}