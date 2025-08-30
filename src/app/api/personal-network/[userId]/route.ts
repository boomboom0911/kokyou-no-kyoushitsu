import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: rawUserId } = await params
    const userId = decodeURIComponent(rawUserId)
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const semester = searchParams.get('semester')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabase
      .from('personal_learning_network')
      .select('*')
      .eq('student_name', userId)

    // 日付フィルターの適用
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    // 年度・学期フィルター（簡易版）
    if (year) {
      const yearNum = parseInt(year)
      query = query.gte('date', `${yearNum}-04-01`)
        .lte('date', `${yearNum + 1}-03-31`)
      
      if (semester) {
        const semesterNum = parseInt(semester)
        if (semesterNum === 1) {
          query = query.gte('date', `${yearNum}-04-01`)
            .lte('date', `${yearNum}-07-31`)
        } else if (semesterNum === 2) {
          query = query.gte('date', `${yearNum}-09-01`)
            .lte('date', `${yearNum}-12-31`)
        } else if (semesterNum === 3) {
          query = query.gte('date', `${yearNum + 1}-01-01`)
            .lte('date', `${yearNum + 1}-03-31`)
        }
      }
    }

    const { data, error } = await query.order('date', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'データの取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}