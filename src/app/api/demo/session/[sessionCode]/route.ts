import { NextRequest, NextResponse } from 'next/server'
import { demoStorage } from '@/lib/demo-storage'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionCode: string }> }
) {
  try {
    const { sessionCode } = await params
    
    // デモストレージからセッション情報を取得
    const session = demoStorage.getSession(sessionCode)
    
    if (!session) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    // デモ用のチャットメッセージを生成
    const messages = [
      {
        id: 'demo-msg-1',
        session_id: session.id,
        sender_name: '田中太郎',
        message: '民主主義について考えることは大切ですね',
        created_at: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 'demo-msg-2',
        session_id: session.id,
        sender_name: '佐藤花子',
        message: '若者の政治参加をもっと促進する必要があると思います',
        created_at: new Date(Date.now() - 180000).toISOString()
      },
      {
        id: 'demo-msg-3',
        session_id: session.id,
        sender_name: '高橋次郎',
        message: '選挙権の年齢を下げることの効果について議論しましょう',
        created_at: new Date(Date.now() - 60000).toISOString()
      }
    ]

    return NextResponse.json({
      session,
      participants: session.participants || {},
      messages
    })

  } catch (error) {
    console.error('Demo session API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// テスト用トピック追加
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionCode: string }> }
) {
  try {
    const { sessionCode } = await params
    const body = await req.json()
    
    if (body.action === 'add-test-topics') {
      const session = demoStorage.addTestTopics(sessionCode)
      if (!session) {
        return NextResponse.json(
          { error: 'セッションが見つかりません' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'テストトピックを追加しました',
        participants: session.participants
      })
    }
    
    return NextResponse.json(
      { error: '無効なアクションです' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Demo session POST error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}