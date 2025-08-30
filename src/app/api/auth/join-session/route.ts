import { NextRequest, NextResponse } from 'next/server'
import { supabase, isDemo } from '@/lib/supabase'
import { validateClassCodeFormat, SessionJoinData } from '@/lib/auth'
import { demoStorage } from '@/lib/demo-storage'

export async function POST(req: NextRequest) {
  try {
    const body: SessionJoinData = await req.json()
    console.log('Join session request:', body)
    console.log('Demo mode:', isDemo)
    
    // バリデーション
    if (!body.sessionCode || !body.studentName) {
      return NextResponse.json(
        { error: 'セッションコードと学生名は必須です' },
        { status: 400 }
      )
    }

    // コード形式の検証
    if (!validateClassCodeFormat(body.sessionCode)) {
      return NextResponse.json(
        { error: '無効なセッションコード形式です' },
        { status: 400 }
      )
    }

    // デモモードの場合
    if (isDemo) {
      console.log('Available demo sessions:', demoStorage.getAllSessions())
      const session = demoStorage.getSession(body.sessionCode)
      console.log('Found session:', session)
      
      if (!session || session.status !== 'active') {
        console.log('Session not found or inactive')
        return NextResponse.json(
          { error: 'セッションが見つからないか、既に終了しています' },
          { status: 404 }
        )
      }

      // 同一セッション内での名前重複チェック
      const participants = session.participants || {}
      if (participants[body.studentName]) {
        return NextResponse.json(
          { error: 'この名前は既に使用されています' },
          { status: 409 }
        )
      }

      // 利用可能な座席を取得（1-42の範囲で空席を確認）
      const occupiedPositions = Object.values(participants).map((p: any) => p.seat_position).filter(Boolean)
      const availableSeats = []
      
      for (let i = 1; i <= 42; i++) {
        if (!occupiedPositions.includes(i)) {
          availableSeats.push(i)
        }
      }

      // 参加者を追加
      demoStorage.addParticipant(body.sessionCode, body.studentName, {
        student_name: body.studentName,
        student_id: body.studentId,
        joined_at: new Date().toISOString(),
        seat_position: undefined,
        topic_title: undefined,
        topic_content: undefined
      })

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        sessionData: {
          id: session.id,
          className: session.class_name,
          date: session.date,
          period: session.period,
          teacherTopicTitle: session.teacher_topic_title,
          teacherTopicContent: session.teacher_topic_content
        },
        availableSeats,
        message: 'デモセッションに参加しました'
      })
    }

    // 実際のデータベース処理（Supabase設定時）
    // セッションの存在確認
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_code', body.sessionCode)
      .eq('status', 'active')
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'セッションが見つからないか、既に終了しています' },
        { status: 404 }
      )
    }

    // 同一セッション内での名前重複チェック
    const { data: existingParticipant } = await supabase
      .from('participants')
      .select('id')
      .eq('session_id', session.id)
      .eq('student_name', body.studentName)
      .single()

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'この名前は既に使用されています' },
        { status: 409 }
      )
    }

    // 利用可能な座席を取得（1-42の範囲で空席を確認）
    const { data: occupiedSeats } = await supabase
      .from('participants')
      .select('seat_position')
      .eq('session_id', session.id)

    const occupiedPositions = occupiedSeats?.map(p => p.seat_position) || []
    const availableSeats = []
    
    for (let i = 1; i <= 42; i++) {
      if (!occupiedPositions.includes(i)) {
        availableSeats.push(i)
      }
    }

    if (availableSeats.length === 0) {
      return NextResponse.json(
        { error: '座席が満席です' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionData: {
        id: session.id,
        className: session.class_name,
        date: session.date,
        period: session.period,
        teacherTopicTitle: session.teacher_topic_title,
        teacherTopicContent: session.teacher_topic_content
      },
      availableSeats,
      message: 'セッションに参加しました'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}