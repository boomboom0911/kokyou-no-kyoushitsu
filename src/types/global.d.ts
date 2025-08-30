declare global {
  var demoSessions: {
    [sessionCode: string]: {
      id: string
      session_code: string
      class_name: string
      date: string
      period: string
      teacher_topic_title?: string
      teacher_topic_content?: string
      status: 'active' | 'closed'
      created_at: string
      participants: {
        [studentName: string]: {
          student_name: string
          student_id?: string
          seat_position?: number
          topic_title?: string
          topic_content?: string
          joined_at: string
          updated_at?: string
        }
      }
    }
  } | undefined
}

export {}