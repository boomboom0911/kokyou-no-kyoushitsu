import { NextRequest, NextResponse } from 'next/server'
import { reactionAPI, isDemo } from '@/lib/supabase'

// POST: いいね追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, reactorName, reactionType = 'like' } = body

    if (!participantId || !reactorName) {
      return NextResponse.json(
        { error: '参加者IDとリアクション者名が必要です' },
        { status: 400 }
      )
    }

    // デモモードの場合
    if (isDemo) {
      const demoReaction = {
        id: `reaction_${Date.now()}`,
        participant_id: participantId,
        reactor_name: reactorName,
        reaction_type: reactionType,
        created_at: new Date().toISOString()
      }

      console.log('Demo reaction added:', demoReaction)

      return NextResponse.json({
        success: true,
        data: demoReaction
      })
    }

    // 実際のデータベース処理
    const reaction = await reactionAPI.like(participantId, reactorName)

    return NextResponse.json({
      success: true,
      data: reaction
    })

  } catch (error) {
    console.error('Reaction error:', error)
    return NextResponse.json(
      { error: 'リアクションの追加に失敗しました' },
      { status: 500 }
    )
  }
}

// GET: リアクション統計取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participantId')

    if (!participantId) {
      return NextResponse.json(
        { error: '参加者IDが必要です' },
        { status: 400 }
      )
    }

    // デモモードの場合
    if (isDemo) {
      const demoStats = {
        likes: Math.floor(Math.random() * 10),
        views: Math.floor(Math.random() * 20)
      }

      return NextResponse.json({
        success: true,
        data: demoStats
      })
    }

    // 実際のデータベース処理
    const stats = await reactionAPI.getStats(participantId)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Reaction stats error:', error)
    return NextResponse.json(
      { error: 'リアクション統計の取得に失敗しました' },
      { status: 500 }
    )
  }
}