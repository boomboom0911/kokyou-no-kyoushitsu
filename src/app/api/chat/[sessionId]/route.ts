import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{
    sessionId: string
  }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params
    const { searchParams } = new URL(req.url)
    
    // クエリパラメータ
    const since = searchParams.get('since')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'セッションIDは必須です' },
        { status: 400 }
      )
    }

    // セッションの存在確認
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, status')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    // チャットメッセージを取得
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(limit)

    // since パラメータがある場合、それ以降のメッセージのみ取得
    if (since) {
      query = query.gt('created_at', since)
    }

    const { data: messages, error: messagesError } = await query

    if (messagesError) {
      console.error('Chat messages fetch error:', messagesError)
      return NextResponse.json(
        { error: 'メッセージの取得に失敗しました' },
        { status: 500 }
      )
    }

    // レスポンス形式に変換
    const formattedMessages = messages?.map(msg => ({
      id: msg.id,
      senderName: msg.sender_name,
      message: msg.message,
      isTeacher: msg.is_teacher,
      createdAt: msg.created_at
    })) || []

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      hasMore: messages?.length === limit,
      sessionStatus: session.status
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}