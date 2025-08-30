'use client'

import React, { useState } from 'react'
import { validateClassCodeFormat } from '@/lib/auth'

export default function HomePage() {
  const [sessionCode, setSessionCode] = useState('')
  const [studentName, setStudentName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // セッション参加処理
  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!sessionCode || !studentName) {
      setError('セッションコードと名前を入力してください')
      return
    }

    if (!validateClassCodeFormat(sessionCode)) {
      setError('セッションコードの形式が正しくありません（例：AB12CD34）')
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch('/api/auth/join-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCode: sessionCode.toUpperCase(),
          studentName: studentName.trim(),
          studentId: studentId.trim() || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'セッション参加に失敗しました')
        return
      }

      // セッション参加成功 - 教室ページに遷移
      // ユーザー情報を保存
      const userInfo = {
        studentName: studentName.trim(),
        studentId: studentId.trim() || undefined,
        joinedAt: new Date().toISOString()
      }
      localStorage.setItem(`classroom_user_${sessionCode.toUpperCase()}`, JSON.stringify(userInfo))
      
      // 教室画面にリダイレクト
      window.location.href = `/classroom/${sessionCode.toUpperCase()}`

    } catch (err) {
      console.error('Join session error:', err)
      setError('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white via-gray-50 to-cyan-50 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-cyan-100">
        {/* ロゴとタイトル */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🏛️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            公共のキョウシツ
          </h1>
          <p className="text-sm text-gray-600">
            民主主義授業支援プラットフォーム
          </p>
        </div>

        {/* 参加フォーム */}
        <form onSubmit={handleJoinSession} className="space-y-6">
          {/* セッションコード入力 */}
          <div>
            <label 
              htmlFor="sessionCode" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              セッションコード
            </label>
            <input
              id="sessionCode"
              type="text"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              placeholder="AB12CD34"
              maxLength={8}
              disabled={isLoading}
              className="w-full px-4 py-3 text-center text-lg font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 tracking-wider text-gray-900 font-bold placeholder-gray-400"
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              先生から伝えられた8桁のコードを入力
            </div>
          </div>

          {/* 名前入力 */}
          <div>
            <label 
              htmlFor="studentName" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              名前
            </label>
            <input
              id="studentName"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="山田太郎"
              maxLength={50}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 font-bold placeholder-gray-500"
              required
            />
          </div>

          {/* 出席番号入力（任意） */}
          <div>
            <label 
              htmlFor="studentId" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              出席番号（任意）
            </label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="01"
              maxLength={20}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 font-bold placeholder-gray-500"
            />
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-800">
                ⚠️ {error}
              </div>
            </div>
          )}

          {/* 参加ボタン */}
          <button
            type="submit"
            disabled={isLoading || !sessionCode || !studentName}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '参加中...' : '授業に参加する'}
          </button>
        </form>

        {/* 注意事項 */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            <div className="font-semibold mb-2">📋 参加について</div>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>セッションコードは先生から伝えられます</li>
              <li>名前は同じセッション内で重複できません</li>
              <li>参加後、座席を選択してトピックを提出します</li>
              <li>他の生徒とチャットで交流できます</li>
            </ul>
          </div>
        </div>

        {/* ナビゲーションリンク */}
        <div className="mt-6 text-center space-y-2">
          <div>
            <a 
              href="/teacher"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              👨‍🏫 教員の方はこちら
            </a>
          </div>
          <div>
            <a 
              href="/metaverse"
              className="text-sm text-purple-600 hover:text-purple-800 underline"
            >
              🌐 メタバース教室で過去の授業を見る
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
