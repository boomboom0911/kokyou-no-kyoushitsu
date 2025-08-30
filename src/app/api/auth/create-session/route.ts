import { NextRequest, NextResponse } from 'next/server'
import { supabase, isDemo } from '@/lib/supabase'
import { generateClassCode, SessionCreateData } from '@/lib/auth'
import { demoStorage } from '@/lib/demo-storage'

export async function POST(req: NextRequest) {
  try {
    const body: SessionCreateData = await req.json()
    
    // バリデーション
    if (!body.className || !body.date || !body.period) {
      return NextResponse.json(
        { error: 'クラス名、日付、時限は必須です' },
        { status: 400 }
      )
    }

    // デモモードの場合
    if (isDemo) {
      const sessionCode = generateClassCode()
      const sessionId = `demo-${Date.now()}`
      
      // デモストレージにセッション情報を保存
      demoStorage.createSession(sessionCode, {
        id: sessionId,
        class_name: body.className,
        date: body.date,
        period: body.period,
        teacher_topic_title: body.teacherTopicTitle,
        teacher_topic_content: body.teacherTopicContent,
        status: 'active',
        created_at: new Date().toISOString(),
        participants: {}
      })

      return NextResponse.json({
        success: true,
        sessionCode,
        sessionId,
        message: 'デモセッションが作成されました'
      })
    }

    // 実際のデータベース処理（Supabase設定時）
    // 同一クラス・日付・時限の重複チェック
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('id')
      .eq('class_name', body.className)
      .eq('date', body.date)
      .eq('period', body.period)
      .single()

    if (existingSession) {
      return NextResponse.json(
        { error: 'この日時のセッションは既に存在します' },
        { status: 409 }
      )
    }

    // ユニークなクラスコードを生成（重複チェック付き）
    let sessionCode: string
    let isUnique = false
    let attempts = 0
    
    do {
      sessionCode = generateClassCode()
      const { data } = await supabase
        .from('sessions')
        .select('id')
        .eq('session_code', sessionCode)
        .single()
      
      isUnique = !data
      attempts++
      
      if (attempts > 10) {
        throw new Error('ユニークなセッションコードの生成に失敗しました')
      }
    } while (!isUnique)

    // セッション作成
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        session_code: sessionCode,
        class_name: body.className,
        date: body.date,
        period: body.period,
        teacher_topic_title: body.teacherTopicTitle,
        teacher_topic_content: body.teacherTopicContent,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Session creation error:', error)
      return NextResponse.json(
        { error: 'セッションの作成に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sessionCode,
      sessionId: data.id,
      message: 'セッションが作成されました'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}