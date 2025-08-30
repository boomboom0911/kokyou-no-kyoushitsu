import { NextRequest, NextResponse } from 'next/server'
import { participantAPI, reactionAPI, commentAPI, isDemo } from '@/lib/supabase'

// GET: 参加者一覧取得
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
      const demoParticipants = [
        {
          id: '1',
          session_id: sessionId,
          student_name: '田中太郎',
          student_id: '001',
          seat_position: 1,
          topic_title: '選挙権について',
          topic_content: '18歳選挙権の意義と課題について考えてみました。',
          joined_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likeCount: 3,
          commentCount: 2
        },
        {
          id: '2',
          session_id: sessionId,
          student_name: '佐藤花子',
          student_id: '002',
          seat_position: 2,
          topic_title: '政治参加',
          topic_content: '政治に関心を持つにはどうすればいいか考察。',
          joined_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likeCount: 1,
          commentCount: 1
        }
      ]

      return NextResponse.json({
        success: true,
        data: demoParticipants
      })
    }

    // 実際のデータベース処理
    const participants = await participantAPI.getBySession(sessionId)
    
    // 各参加者のいいね数とコメント数を取得
    const participantsWithStats = await Promise.all(
      participants.map(async (participant) => {
        const stats = await reactionAPI.getStats(participant.id)
        const comments = await commentAPI.getByParticipant(participant.id)
        
        return {
          ...participant,
          likeCount: stats.likes,
          commentCount: comments.length
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: participantsWithStats
    })

  } catch (error) {
    console.error('Participants fetch error:', error)
    return NextResponse.json(
      { error: '参加者情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: 参加者情報更新（トピック提出など）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, topicTitle, topicContent } = body

    if (!participantId) {
      return NextResponse.json(
        { error: '参加者IDが必要です' },
        { status: 400 }
      )
    }

    // デモモードの場合
    if (isDemo) {
      const updatedParticipant = {
        id: participantId,
        topic_title: topicTitle,
        topic_content: topicContent,
        updated_at: new Date().toISOString()
      }

      console.log('Demo participant updated:', updatedParticipant)

      return NextResponse.json({
        success: true,
        data: updatedParticipant
      })
    }

    // 実際のデータベース処理
    const updatedParticipant = await participantAPI.updateTopic(participantId, {
      topic_title: topicTitle,
      topic_content: topicContent
    })

    return NextResponse.json({
      success: true,
      data: updatedParticipant
    })

  } catch (error) {
    console.error('Participant update error:', error)
    return NextResponse.json(
      { error: '参加者情報の更新に失敗しました' },
      { status: 500 }
    )
  }
}