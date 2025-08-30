import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface TopicSubmissionData {
  participantId: string
  topicTitle: string
  topicContent?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: TopicSubmissionData = await req.json()
    
    // バリデーション
    if (!body.participantId || !body.topicTitle) {
      return NextResponse.json(
        { error: '参加者IDとトピックタイトルは必須です' },
        { status: 400 }
      )
    }

    if (body.topicTitle.length > 100) {
      return NextResponse.json(
        { error: 'トピックタイトルは100文字以内で入力してください' },
        { status: 400 }
      )
    }

    if (body.topicContent && body.topicContent.length > 500) {
      return NextResponse.json(
        { error: 'トピック内容は500文字以内で入力してください' },
        { status: 400 }
      )
    }

    // 参加者の存在確認
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('*, sessions!inner(*)')
      .eq('id', body.participantId)
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: '参加者が見つかりません' },
        { status: 404 }
      )
    }

    // セッションが有効かチェック
    if (participant.sessions.status !== 'active') {
      return NextResponse.json(
        { error: 'セッションが終了しているため、トピックを提出できません' },
        { status: 400 }
      )
    }

    // トピックを更新
    const { data: updatedParticipant, error: updateError } = await supabase
      .from('participants')
      .update({
        topic_title: body.topicTitle.trim(),
        topic_content: body.topicContent?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.participantId)
      .select()
      .single()

    if (updateError) {
      console.error('Topic update error:', updateError)
      return NextResponse.json(
        { error: 'トピックの提出に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      participant: {
        id: updatedParticipant.id,
        sessionId: updatedParticipant.session_id,
        studentName: updatedParticipant.student_name,
        studentId: updatedParticipant.student_id,
        seatPosition: updatedParticipant.seat_position,
        topicTitle: updatedParticipant.topic_title,
        topicContent: updatedParticipant.topic_content,
        joinedAt: updatedParticipant.joined_at,
        updatedAt: updatedParticipant.updated_at
      },
      message: 'トピックを提出しました'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}