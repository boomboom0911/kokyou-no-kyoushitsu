import { NextRequest, NextResponse } from 'next/server'
import { sessionAPI, isDemo } from '@/lib/supabase'
import { generateClassCode, validateClassCodeFormat } from '@/lib/auth'

// POST: セッション作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { className, date, period, teacherTopicTitle, teacherTopicContent } = body

    // 入力検証
    if (!className || !date || !period) {
      return NextResponse.json(
        { error: 'クラス名、日付、時限は必須です' },
        { status: 400 }
      )
    }

    // デモモードの場合
    if (isDemo) {
      const demoSessionCode = generateClassCode()
      const demoSessionData = {
        id: `session_${Date.now()}`,
        sessionCode: demoSessionCode,
        sessionId: `session_${Date.now()}`,
        className,
        date,
        period,
        teacherTopicTitle,
        teacherTopicContent,
        status: 'active',
        createdAt: new Date().toISOString()
      }

      console.log('Demo session created:', demoSessionData)
      
      return NextResponse.json({
        success: true,
        data: demoSessionData
      })
    }

    // 実際のデータベース処理
    const sessionCode = generateClassCode()
    const sessionData = await sessionAPI.create({
      session_code: sessionCode,
      class_name: className,
      date,
      period: parseInt(period),
      teacher_topic_title: teacherTopicTitle || null,
      teacher_topic_content: teacherTopicContent || null,
      status: 'active'
    })

    return NextResponse.json({
      success: true,
      data: {
        ...sessionData,
        sessionCode: sessionData.session_code,
        sessionId: sessionData.id
      }
    })

  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'セッション作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// GET: セッション情報取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionCode = searchParams.get('code')

    if (!sessionCode) {
      return NextResponse.json(
        { error: 'セッションコードが必要です' },
        { status: 400 }
      )
    }

    // コード形式の検証
    if (!validateClassCodeFormat(sessionCode)) {
      return NextResponse.json(
        { error: '無効なセッションコード形式です' },
        { status: 400 }
      )
    }

    // デモモードの場合
    if (isDemo) {
      const demoSession = {
        id: `demo_session_${sessionCode}`,
        session_code: sessionCode,
        class_name: '3組',
        date: new Date().toISOString().split('T')[0],
        period: 3,
        status: 'active',
        teacher_topic_title: 'デモ授業',
        teacher_topic_content: 'これはデモセッションです',
        created_at: new Date().toISOString(),
        closed_at: null
      }

      return NextResponse.json({
        success: true,
        data: demoSession
      })
    }

    // 実際のデータベース処理
    const sessionData = await sessionAPI.findByCode(sessionCode)

    return NextResponse.json({
      success: true,
      data: sessionData
    })

  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: 'セッションが見つかりません' },
      { status: 404 }
    )
  }
}