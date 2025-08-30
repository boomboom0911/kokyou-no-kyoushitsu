import { NextRequest, NextResponse } from 'next/server'
import { sessionAPI, participantAPI, isDemo } from '@/lib/supabase'
import { validateClassCodeFormat } from '@/lib/auth'

// POST: 認証（セッション参加）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionCode, studentName, studentId } = body

    // 入力検証
    if (!sessionCode || !studentName) {
      return NextResponse.json(
        { error: 'セッションコードと生徒名は必須です' },
        { status: 400 }
      )
    }

    // セッションコード形式の検証
    if (!validateClassCodeFormat(sessionCode)) {
      return NextResponse.json(
        { error: '無効なセッションコード形式です' },
        { status: 400 }
      )
    }

    // デモモードの場合
    if (isDemo) {
      const demoParticipantData = {
        id: `participant_${Date.now()}`,
        sessionId: `demo_session_${sessionCode}`,
        studentName,
        studentId: studentId || null,
        seatPosition: Math.floor(Math.random() * 42) + 1, // 1-42のランダム席
        joinedAt: new Date().toISOString()
      }

      console.log('Demo participant joined:', demoParticipantData)

      return NextResponse.json({
        success: true,
        data: {
          participant: demoParticipantData,
          session: {
            id: `demo_session_${sessionCode}`,
            session_code: sessionCode,
            class_name: '3組',
            date: new Date().toISOString().split('T')[0],
            period: 3,
            status: 'active',
            teacher_topic_title: 'デモ授業',
            teacher_topic_content: 'これはデモセッションです'
          }
        }
      })
    }

    // 実際のデータベース処理
    // 1. セッション存在確認
    const session = await sessionAPI.findByCode(sessionCode)
    
    if (!session) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    // 2. 既存参加者確認
    const existingParticipants = await participantAPI.getBySession(session.id)
    const existingParticipant = existingParticipants.find(p => 
      p.student_name === studentName || 
      (studentId && p.student_id === studentId)
    )

    if (existingParticipant) {
      return NextResponse.json({
        success: true,
        data: {
          participant: existingParticipant,
          session
        },
        message: '既に参加済みです'
      })
    }

    // 3. 空席を見つけて参加
    const occupiedSeats = existingParticipants.map(p => p.seat_position)
    const availableSeats = Array.from({ length: 42 }, (_, i) => i + 1)
      .filter(seat => !occupiedSeats.includes(seat))

    if (availableSeats.length === 0) {
      return NextResponse.json(
        { error: '座席が満席です' },
        { status: 400 }
      )
    }

    const assignedSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)]

    // 4. 参加者登録
    const participant = await participantAPI.join({
      session_id: session.id,
      student_name: studentName,
      student_id: studentId || null,
      seat_position: assignedSeat
    })

    return NextResponse.json({
      success: true,
      data: {
        participant,
        session
      }
    })

  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { error: '認証中にエラーが発生しました' },
      { status: 500 }
    )
  }
}