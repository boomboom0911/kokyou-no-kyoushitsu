import { NextRequest, NextResponse } from 'next/server'
import { commentAPI, isDemo } from '@/lib/supabase'

// POST: コメント追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, commenterName, content } = body

    if (!participantId || !commenterName || !content) {
      return NextResponse.json(
        { error: '参加者ID、コメント者名、コメント内容が必要です' },
        { status: 400 }
      )
    }

    // デモモードの場合
    if (isDemo) {
      const demoComment = {
        id: `comment_${Date.now()}`,
        participant_id: participantId,
        commenter_name: commenterName,
        content,
        created_at: new Date().toISOString()
      }

      console.log('Demo comment added:', demoComment)

      return NextResponse.json({
        success: true,
        data: demoComment
      })
    }

    // 実際のデータベース処理
    const comment = await commentAPI.add({
      participant_id: participantId,
      commenter_name: commenterName,
      content
    })

    return NextResponse.json({
      success: true,
      data: comment
    })

  } catch (error) {
    console.error('Comment error:', error)
    return NextResponse.json(
      { error: 'コメントの追加に失敗しました' },
      { status: 500 }
    )
  }
}

// GET: 参加者のコメント一覧取得
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
      const demoComments = [
        {
          id: 'c1',
          participant_id: participantId,
          commenter_name: '田中',
          content: '確かに投票率の低下は問題ですね',
          created_at: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: 'c2',
          participant_id: participantId,
          commenter_name: '佐藤',
          content: 'メディアリテラシーも重要だと思います',
          created_at: new Date(Date.now() - 200000).toISOString()
        }
      ]

      return NextResponse.json({
        success: true,
        data: demoComments
      })
    }

    // 実際のデータベース処理
    const comments = await commentAPI.getByParticipant(participantId)

    return NextResponse.json({
      success: true,
      data: comments
    })

  } catch (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json(
      { error: 'コメントの取得に失敗しました' },
      { status: 500 }
    )
  }
}