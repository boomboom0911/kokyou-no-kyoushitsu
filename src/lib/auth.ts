// 8桁クラスコード認証システム

/**
 * 8桁のランダムなクラスコードを生成
 * 形式: AB12CD34 (大文字2桁 + 数字2桁 + 大文字2桁 + 数字2桁)
 */
export function generateClassCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  
  let code = ''
  code += letters[Math.floor(Math.random() * letters.length)]
  code += letters[Math.floor(Math.random() * letters.length)]
  code += numbers[Math.floor(Math.random() * numbers.length)]
  code += numbers[Math.floor(Math.random() * numbers.length)]
  code += letters[Math.floor(Math.random() * letters.length)]
  code += letters[Math.floor(Math.random() * letters.length)]
  code += numbers[Math.floor(Math.random() * numbers.length)]
  code += numbers[Math.floor(Math.random() * numbers.length)]
  
  return code
}

/**
 * クラスコードの形式を検証
 * @param code - 検証するコード
 * @returns 有効性
 */
export function validateClassCodeFormat(code: string): boolean {
  const pattern = /^[A-Z]{2}\d{2}[A-Z]{2}\d{2}$/
  return pattern.test(code)
}

/**
 * セッション参加データの型定義
 */
export interface SessionJoinData {
  sessionCode: string
  studentName: string
  studentId?: string
}

/**
 * セッション作成データの型定義
 */
export interface SessionCreateData {
  className: string
  date: string
  period: number
  teacherTopicTitle?: string
  teacherTopicContent?: string
}

/**
 * 参加者データの型定義
 */
export interface ParticipantData {
  id: string
  sessionId: string
  studentName: string
  studentId?: string
  seatPosition?: number
  topicTitle?: string
  topicContent?: string
  likeCount?: number
  commentCount?: number
  joinedAt: string
}

/**
 * セッション状態の管理
 */
export type SessionStatus = 'active' | 'closed'

/**
 * コメントデータの型定義
 */
export interface CommentData {
  id: string
  participantId: string
  senderName: string
  content: string
  createdAt: string
}

/**
 * セッションデータの型定義
 */
export interface SessionData {
  id: string
  sessionCode: string
  className: string
  date: string
  period: number
  status: SessionStatus
  teacherTopicTitle?: string
  teacherTopicContent?: string
  createdAt: string
  closedAt?: string
}