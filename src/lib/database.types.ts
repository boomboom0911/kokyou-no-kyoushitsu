// データベース型定義
export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          session_code: string
          class_name: string
          date: string
          period: number
          status: 'active' | 'closed'
          teacher_topic_title: string | null
          teacher_topic_content: string | null
          created_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          session_code: string
          class_name: string
          date: string
          period: number
          status?: 'active' | 'closed'
          teacher_topic_title?: string | null
          teacher_topic_content?: string | null
          created_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          session_code?: string
          class_name?: string
          date?: string
          period?: number
          status?: 'active' | 'closed'
          teacher_topic_title?: string | null
          teacher_topic_content?: string | null
          created_at?: string
          closed_at?: string | null
        }
      }
      participants: {
        Row: {
          id: string
          session_id: string
          student_name: string
          student_id: string | null
          seat_position: number
          topic_title: string | null
          topic_content: string | null
          joined_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          student_name: string
          student_id?: string | null
          seat_position: number
          topic_title?: string | null
          topic_content?: string | null
          joined_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          student_name?: string
          student_id?: string | null
          seat_position?: number
          topic_title?: string | null
          topic_content?: string | null
          joined_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          sender_name: string
          message: string
          is_teacher: boolean
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          sender_name: string
          message: string
          is_teacher?: boolean
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          sender_name?: string
          message?: string
          is_teacher?: boolean
          created_at?: string
          deleted_at?: string | null
        }
      }
      topic_reactions: {
        Row: {
          id: string
          participant_id: string
          reactor_name: string
          reaction_type: 'like' | 'view'
          created_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          reactor_name: string
          reaction_type: 'like' | 'view'
          created_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          reactor_name?: string
          reaction_type?: 'like' | 'view'
          created_at?: string
        }
      }
      topic_comments: {
        Row: {
          id: string
          participant_id: string
          commenter_name: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          commenter_name: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          commenter_name?: string
          content?: string
          created_at?: string
        }
      }
    }
  }
}