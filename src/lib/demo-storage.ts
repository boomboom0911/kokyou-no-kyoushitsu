// デモモード用の一時的なセッション管理
// 実際の本番環境ではRedisなどを使用することを推奨

interface DemoSession {
  id: string
  session_code: string
  class_name: string
  date: string
  period: number
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

// グローバルメモリストレージ（開発用）
declare global {
  var demoSessionsGlobal: Map<string, DemoSession> | undefined
}

const demoSessions = globalThis.demoSessionsGlobal ?? new Map<string, DemoSession>()
globalThis.demoSessionsGlobal = demoSessions

export const demoStorage = {
  // セッション作成
  createSession: (sessionCode: string, sessionData: Omit<DemoSession, 'session_code'>) => {
    const session: DemoSession = {
      ...sessionData,
      session_code: sessionCode
    }
    demoSessions.set(sessionCode, session)
    console.log(`Created demo session: ${sessionCode}`)
    return session
  },

  // セッション取得
  getSession: (sessionCode: string): DemoSession | undefined => {
    const session = demoSessions.get(sessionCode)
    console.log(`Getting session ${sessionCode}:`, session ? 'found' : 'not found')
    return session
  },

  // セッション更新
  updateSession: (sessionCode: string, updates: Partial<DemoSession>) => {
    const session = demoSessions.get(sessionCode)
    if (session) {
      const updatedSession = { ...session, ...updates }
      demoSessions.set(sessionCode, updatedSession)
      return updatedSession
    }
    return null
  },

  // 参加者追加
  addParticipant: (sessionCode: string, studentName: string, participantData: DemoSession['participants'][string]) => {
    const session = demoSessions.get(sessionCode)
    if (session) {
      session.participants[studentName] = participantData
      demoSessions.set(sessionCode, session)
      console.log(`Added participant ${studentName} to session ${sessionCode}`)
      return session
    }
    return null
  },

  // 参加者更新
  updateParticipant: (sessionCode: string, studentName: string, updates: Partial<DemoSession['participants'][string]>) => {
    const session = demoSessions.get(sessionCode)
    if (session && session.participants[studentName]) {
      session.participants[studentName] = {
        ...session.participants[studentName],
        ...updates,
        updated_at: new Date().toISOString()
      }
      demoSessions.set(sessionCode, session)
      return session
    }
    return null
  },

  // 全セッション一覧（デバッグ用）
  getAllSessions: () => {
    return Array.from(demoSessions.keys())
  },

  // セッション削除
  deleteSession: (sessionCode: string) => {
    return demoSessions.delete(sessionCode)
  },

  // テストデータ追加（開発用）
  addTestTopics: (sessionCode: string) => {
    const session = demoSessions.get(sessionCode)
    if (!session) return null

    const testTopics = {
      "田中花子": {
        topic_title: "若者の政治参加促進",
        topic_content: "SNSやオンライン投票システムを活用して、若者がもっと気軽に政治に参加できる仕組みを作るべきだと思います。現在の投票率の低さは、政治への関心不足というより、参加しやすい環境が整っていないことが原因だと考えます。"
      },
      "佐藤太郎": {
        topic_title: "地域コミュニティの活性化", 
        topic_content: "地方自治の課題解決には、住民同士の繋がりが重要です。町内会やボランティア活動を通じて、地域の問題を共有し、協力して解決策を見つけることが民主主義の基本だと思います。"
      },
      "田中太郎": {
        topic_title: "デジタル民主主義の可能性",
        topic_content: "ブロックチェーン技術を使った透明性の高い意思決定システムや、AIを活用した政策分析ツールなど、テクノロジーの力で民主主義をより効率的で公平なものにできるのではないでしょうか。"
      },
      "山田太郎": {
        topic_title: "教育と民主主義",
        topic_content: "学校教育の段階から、議論や合意形成の方法を学ぶことが重要です。模擬議会や生徒会活動を通じて、民主的な意思決定プロセスを体験することで、将来の有権者としての素養を身につけられます。"
      }
    }

    Object.entries(testTopics).forEach(([name, topic]) => {
      if (session.participants[name]) {
        session.participants[name] = {
          ...session.participants[name],
          ...topic,
          seat_position: undefined,
          updated_at: new Date().toISOString()
        }
      }
    })

    demoSessions.set(sessionCode, session)
    console.log(`Added test topics to session ${sessionCode}`)
    return session
  }
}