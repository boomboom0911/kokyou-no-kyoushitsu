import { NextRequest, NextResponse } from 'next/server'
import { chatAPI, isDemo } from '@/lib/supabase'

// POST: チャットメッセージ送信
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, senderName, message, isTeacher = false } = body

    if (!sessionId || !senderName || !message) {
      return NextResponse.json(
        { error: 'セッションID、送信者名、メッセージが必要です' },
        { status: 400 }
      )
    }

    // デモモードの場合
    if (isDemo) {
      const demoMessage = {
        id: `message_${Date.now()}`,
        session_id: sessionId,
        sender_name: senderName,
        message,
        is_teacher: isTeacher,
        created_at: new Date().toISOString(),
        deleted_at: null
      }

      console.log('Demo chat message sent:', demoMessage)

      return NextResponse.json({
        success: true,
        data: demoMessage
      })
    }

    // 実際のデータベース処理
    const chatMessage = await chatAPI.send({
      session_id: sessionId,
      sender_name: senderName,
      message,
      is_teacher: isTeacher
    })

    return NextResponse.json({
      success: true,
      data: chatMessage
    })

  } catch (error) {
    console.error('Chat message error:', error)
    return NextResponse.json(
      { error: 'メッセージの送信に失敗しました' },
      { status: 500 }
    )
  }
}

// GET: チャットメッセージ取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'セッションIDが必要です' },
        { status: 400 }
      )
    }

    // デモモードの場合
    if (isDemo) {
      const demoMessages = [
        {
          id: '1',
          session_id: sessionId,
          sender_name: '先生',
          message: '今日は投票制度について話しましょう',
          is_teacher: true,
          created_at: new Date(Date.now() - 600000).toISOString(),
          deleted_at: null
        },
        {
          id: '2',
          session_id: sessionId,
          sender_name: '田中太郎',
          message: '18歳選挙権の意味を知りたいです',
          is_teacher: false,
          created_at: new Date(Date.now() - 400000).toISOString(),
          deleted_at: null
        },
        {
          id: '3',
          session_id: sessionId,
          sender_name: '佐藤花子',
          message: '政治に関心を持つにはどうすればいいですか？',
          is_teacher: false,
          created_at: new Date(Date.now() - 200000).toISOString(),
          deleted_at: null
        }
      ]

      return NextResponse.json({
        success: true,
        data: demoMessages
      })
    }

    // 実際のデータベース処理
    const messages = await chatAPI.getBySession(sessionId)

    return NextResponse.json({
      success: true,
      data: messages
    })

  } catch (error) {
    console.error('Chat messages fetch error:', error)
    return NextResponse.json(
      { error: 'メッセージの取得に失敗しました' },
      { status: 500 }
    )
  }
}