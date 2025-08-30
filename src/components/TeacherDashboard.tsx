'use client'

import React, { useState } from 'react'
import { generateClassCode } from '@/lib/auth'
import TeacherClassroomView from './TeacherClassroomView'
import SystemStatus from './SystemStatus'

interface SessionCreateForm {
  className: string
  date: string
  period: number
  teacherTopicTitle: string
  teacherTopicContent: string
}

interface TeacherDashboardProps {
  onSessionCreated?: (sessionData: any) => void
}

export default function TeacherDashboard({ onSessionCreated }: TeacherDashboardProps) {
  const [form, setForm] = useState<SessionCreateForm>({
    className: '',
    date: new Date().toISOString().split('T')[0], // 今日の日付
    period: 1,
    teacherTopicTitle: '',
    teacherTopicContent: ''
  })
  
  const [createdSession, setCreatedSession] = useState<{
    sessionCode: string
    sessionId: string
  } | null>(null)
  const [showClassroomView, setShowClassroomView] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSystemStatus, setShowSystemStatus] = useState(false)

  // セッション作成処理（API版）
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.className || !form.date || !form.period) {
      setError('クラス名、日付、時限は必須です')
      return
    }

    try {
      setIsLoading(true)

      // API呼び出し
      const response = await fetch('/api/auth/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          className: form.className,
          date: form.date,
          period: form.period,
          teacherTopicTitle: form.teacherTopicTitle,
          teacherTopicContent: form.teacherTopicContent
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'セッション作成に失敗しました')
      }

      setCreatedSession({
        sessionCode: result.sessionCode,
        sessionId: result.sessionId
      })

      if (onSessionCreated) {
        onSessionCreated({
          sessionCode: result.sessionCode,
          sessionId: result.sessionId,
          ...form
        })
      }

    } catch (err: any) {
      console.error('Session creation error:', err)
      setError(err.message || 'セッション作成中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  // セッション終了処理（デモ版）
  const handleCloseSession = async () => {
    if (!createdSession) return

    const confirmed = confirm('セッションを終了しますか？\n終了後は新しい参加者は入れません。')
    if (!confirmed) return

    try {
      setIsLoading(true)

      // デモ用：実際のAPI呼び出しをシミュレート
      await new Promise(resolve => setTimeout(resolve, 800))

      alert(`セッションを終了しました。\n参加者数: 7人`)
      setCreatedSession(null)
      setShowClassroomView(false)

    } catch (err) {
      console.error('Session close error:', err)
      alert('セッション終了時にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 新しいセッションを作成
  const handleNewSession = () => {
    setCreatedSession(null)
    setError('')
    setForm({
      className: '',
      date: new Date().toISOString().split('T')[0],
      period: 1,
      teacherTopicTitle: '',
      teacherTopicContent: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-2xl p-6 mb-6 border border-gray-200">
          <div className="text-center">
            <div className="text-4xl mb-4">👨‍🏫</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              教員管理画面
            </h1>
            <p className="text-gray-600 mb-4">
              公共のキョウシツ - 民主主義授業支援プラットフォーム
            </p>
            <button
              onClick={() => setShowSystemStatus(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              🧪 システムテスト
            </button>
          </div>
        </div>

        {!createdSession ? (
          /* セッション作成フォーム */
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl p-8 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📅 新規授業セッション作成
            </h2>

            <form onSubmit={handleCreateSession} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* クラス名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    クラス名
                  </label>
                  <select
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-gray-900 font-bold placeholder-gray-500"
                  >
                    <option value="">選択してください</option>
                    <option value="1組">1組</option>
                    <option value="2組">2組</option>
                    <option value="3組">3組</option>
                    <option value="4組">4組</option>
                    <option value="5組">5組</option>
                  </select>
                </div>

                {/* 日付 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    日付
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-gray-900 font-bold placeholder-gray-500"
                  />
                </div>

                {/* 時限 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    時限
                  </label>
                  <select
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: parseInt(e.target.value) })}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-gray-900 font-bold placeholder-gray-500"
                  >
                    {[1,2,3,4,5,6].map(p => (
                      <option key={p} value={p}>{p}時限</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* トピックタイトル */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  今日のトピック（タイトル）
                </label>
                <input
                  type="text"
                  value={form.teacherTopicTitle}
                  onChange={(e) => setForm({ ...form, teacherTopicTitle: e.target.value })}
                  placeholder="例：民主主義と政治参加"
                  maxLength={100}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-gray-900 font-bold placeholder-gray-500"
                />
              </div>

              {/* トピック内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  トピック詳細（任意）
                </label>
                <textarea
                  value={form.teacherTopicContent}
                  onChange={(e) => setForm({ ...form, teacherTopicContent: e.target.value })}
                  placeholder="生徒に伝えたい詳細な内容や考えてほしい視点を記入してください"
                  rows={4}
                  maxLength={500}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none text-gray-900 font-bold placeholder-gray-500"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {form.teacherTopicContent.length}/500
                </div>
              </div>

              {/* エラーメッセージ */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm text-red-800">
                    ⚠️ {error}
                  </div>
                </div>
              )}

              {/* 作成ボタン */}
              <button
                type="submit"
                disabled={isLoading || !form.className}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
              >
                {isLoading ? 'セッション作成中...' : '📝 授業を開始する'}
              </button>

              {/* システムテストボタン */}
              <button
                type="button"
                onClick={() => setShowSystemStatus(true)}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                🧪 システムテスト
              </button>
            </form>
            
            {/* メタバース教室リンク */}
            <div className="text-center mt-4">
              <a 
                href="/metaverse"
                className="text-purple-600 hover:text-purple-800 underline text-sm"
              >
                🌐 メタバース教室で過去の授業を見る
              </a>
            </div>
          </div>
        ) : (
          /* 作成済みセッション管理 */
          <div className="space-y-6">
            {/* セッション情報 */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl p-8 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                🎯 授業セッション管理
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* セッションコード表示 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-800 mb-3">
                    📱 生徒用セッションコード
                  </h3>
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold text-green-700 mb-3 tracking-wider">
                      {createdSession.sessionCode}
                    </div>
                    <div className="bg-white border-2 border-dashed border-green-300 rounded-lg p-4 mb-3">
                      <div className="text-6xl">📱</div>
                      <div className="text-sm text-green-600 mt-2">
                        QRコード<br />
                        <span className="text-xs">（実装予定）</span>
                      </div>
                    </div>
                    <div className="text-sm text-green-700">
                      このコードを生徒に伝えてください
                    </div>
                  </div>
                </div>

                {/* セッション詳細 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-800 mb-3">
                    📋 授業情報
                  </h3>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div><span className="font-medium">クラス:</span> {form.className}</div>
                    <div><span className="font-medium">日付:</span> {form.date}</div>
                    <div><span className="font-medium">時限:</span> {form.period}時限</div>
                    {form.teacherTopicTitle && (
                      <div><span className="font-medium">トピック:</span> {form.teacherTopicTitle}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowClassroomView(true)}
                  className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  📊 授業管理画面
                </button>
                <a
                  href="/demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors text-center"
                >
                  🖥️ 教室画面を開く
                </a>
                <button
                  onClick={handleCloseSession}
                  disabled={isLoading}
                  className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-300 transition-colors"
                >
                  {isLoading ? '終了中...' : '🔚 授業終了'}
                </button>
              </div>
            </div>

            {/* 新しいセッション作成ボタン */}
            <div className="text-center space-y-3">
              <button
                onClick={handleNewSession}
                className="bg-gray-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                ➕ 新しいセッションを作成
              </button>
              
              <div>
                <a 
                  href="/metaverse"
                  className="text-purple-600 hover:text-purple-800 underline text-sm"
                >
                  🌐 メタバース教室で過去の授業を見る
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 授業管理画面 */}
        {showClassroomView && createdSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-7xl mx-auto">
                {/* ヘッダー */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">📊 授業管理画面</h2>
                  <button
                    onClick={() => setShowClassroomView(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
                  >
                    ✕
                  </button>
                </div>

                {/* コンテンツ */}
                <TeacherClassroomView
                  sessionData={{
                    sessionCode: createdSession.sessionCode,
                    sessionId: createdSession.sessionId,
                    className: form.className,
                    date: form.date,
                    period: form.period,
                    teacherTopicTitle: form.teacherTopicTitle,
                    teacherTopicContent: form.teacherTopicContent
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* システムテスト */}
        {showSystemStatus && (
          <SystemStatus onClose={() => setShowSystemStatus(false)} />
        )}
      </div>
    </div>
  )
}