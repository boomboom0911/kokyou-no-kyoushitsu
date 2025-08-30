import { NextRequest, NextResponse } from 'next/server'
import { supabase, isDemo } from '@/lib/supabase'

interface SeatSelectData {
  sessionId: string
  seatPosition: number
  studentName: string
  studentId?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: SeatSelectData = await req.json()
    
    // バリデーション
    if (!body.sessionId || !body.seatPosition || !body.studentName) {
      return NextResponse.json(
        { error: 'セッションID、座席位置、学生名は必須です' },
        { status: 400 }
      )
    }

    if (body.seatPosition < 1 || body.seatPosition > 42) {
      return NextResponse.json(
        { error: '無効な座席位置です' },
        { status: 400 }
      )
    }

    // デモモードの場合
    if (isDemo) {
      global.demoSessions = global.demoSessions || {}
      
      // セッションIDからセッションコードを見つける
      let session = null
      let sessionCode = null
      for (const [code, sess] of Object.entries(global.demoSessions)) {
        if ((sess as any).id === body.sessionId) {
          session = sess
          sessionCode = code
          break
        }
      }
      
      if (!session) {
        return NextResponse.json(
          { error: 'セッションが見つかりません' },
          { status: 404 }
        )
      }
      
      const participants = (session as any).participants || {}
      
      // 座席の重複チェック
      for (const [name, participant] of Object.entries(participants)) {
        if ((participant as any).seat_position === body.seatPosition) {
          return NextResponse.json(
            { error: `座席 #${body.seatPosition} は既に ${name} さんが使用中です` },
            { status: 409 }
          )
        }
      }
      
      // 参加者情報を更新
      if (participants[body.studentName]) {
        participants[body.studentName] = {
          ...participants[body.studentName],
          seat_position: body.seatPosition,
          updated_at: new Date().toISOString()
        }
      } else {
        participants[body.studentName] = {
          student_name: body.studentName,
          student_id: body.studentId,
          seat_position: body.seatPosition,
          joined_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          topic_title: null,
          topic_content: null
        }
      }
      
      (session as any).participants = participants
      
      return NextResponse.json({
        success: true,
        participant: {
          id: `demo-${body.studentName}`,
          sessionId: body.sessionId,
          studentName: body.studentName,
          studentId: body.studentId,
          seatPosition: body.seatPosition,
          joinedAt: participants[body.studentName].joined_at
        },
        message: `座席 #${body.seatPosition} を選択しました（デモモード）`
      })
    }

    // 実際のデータベース処理
    // セッションの存在確認
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', body.sessionId)
      .eq('status', 'active')
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'セッションが見つからないか、既に終了しています' },
        { status: 404 }
      )
    }

    // 座席の重複チェック
    const { data: existingSeat } = await supabase
      .from('participants')
      .select('id, student_name')
      .eq('session_id', body.sessionId)
      .eq('seat_position', body.seatPosition)
      .single()

    if (existingSeat) {
      return NextResponse.json(
        { error: `座席 #${body.seatPosition} は既に ${existingSeat.student_name} さんが使用中です` },
        { status: 409 }
      )
    }

    // 同一名前の重複チェック
    const { data: existingName } = await supabase
      .from('participants')
      .select('id, seat_position')
      .eq('session_id', body.sessionId)
      .eq('student_name', body.studentName)
      .single()

    if (existingName) {
      return NextResponse.json(
        { error: `${body.studentName} さんは既に座席 #${existingName.seat_position} に参加しています` },
        { status: 409 }
      )
    }

    // 参加者として座席に追加
    const { data: participant, error: insertError } = await supabase
      .from('participants')
      .insert({
        session_id: body.sessionId,
        student_name: body.studentName,
        student_id: body.studentId,
        seat_position: body.seatPosition
      })
      .select()
      .single()

    if (insertError) {
      console.error('Participant insertion error:', insertError)
      return NextResponse.json(
        { error: '座席選択に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        sessionId: participant.session_id,
        studentName: participant.student_name,
        studentId: participant.student_id,
        seatPosition: participant.seat_position,
        joinedAt: participant.joined_at
      },
      message: `座席 #${body.seatPosition} を選択しました`
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}