import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface ChatSendData {
  sessionId: string
  message: string
  senderName: string
  isTeacher?: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatSendData = await req.json()
    
    // バリデーション
    if (!body.sessionId || !body.message || !body.senderName) {
      return NextResponse.json(
        { error: 'セッションID、メッセージ、送信者名は必須です' },
        { status: 400 }
      )
    }

    if (body.message.length > 200) {
      return NextResponse.json(
        { error: 'メッセージは200文字以内で入力してください' },
        { status: 400 }
      )
    }

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

    // チャットメッセージを挿入
    const { data: message, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: body.sessionId,
        sender_name: body.senderName.trim(),
        message: body.message.trim(),
        is_teacher: body.isTeacher || false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Chat message insertion error:', insertError)
      return NextResponse.json(
        { error: 'メッセージの送信に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        sessionId: message.session_id,
        senderName: message.sender_name,
        message: message.message,
        isTeacher: message.is_teacher,
        createdAt: message.created_at
      },
      status: 'メッセージを送信しました'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}