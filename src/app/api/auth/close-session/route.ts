import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'セッションIDは必須です' },
        { status: 400 }
      )
    }

    // セッションの存在確認
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    if (session && session.status === 'closed') {
      return NextResponse.json(
        { error: 'セッションは既に終了しています' },
        { status: 400 }
      )
    }

    // セッションを閉じる
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ 
        status: 'closed',
        closed_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Session close error:', updateError)
      return NextResponse.json(
        { error: 'セッションの終了に失敗しました' },
        { status: 500 }
      )
    }

    // 参加者数を取得
    const { data: participants, error: participantError } = await supabase
      .from('participants')
      .select('id')
      .eq('session_id', sessionId)

    const participantCount = participants?.length || 0

    return NextResponse.json({
      success: true,
      participantCount,
      message: 'セッションを終了しました',
      closedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}