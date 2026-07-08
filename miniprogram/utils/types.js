// 核心数据类型定义

// 情绪诱因类型
export type TriggerType =
  | 'anxiety'
  | 'loneliness'
  | 'fatigue'
  | 'boredom'
  | 'stress'
  | 'craving'
  | 'other'

// 事件记录：克制成功 / 放纵
export interface EventRecord {
  id: string
  timestamp: number
  type: 'restrain' | 'relapse'
  trigger: TriggerType
  scenario: string
  outcomeNote: string
  relatedTradeoffId?: string
}

// 得失权衡笔记
export interface TradeoffNote {
  id: string
  timestamp: number
  longGoal: string
  requirements: string[]
  sacrifices: string[]
  shortGain: string
  longReward: string
}

// 对话消息
export interface DialogMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
}

// 对话会话
export interface DialogSession {
  id: string
  timestamp: number
  trigger: TriggerType | 'none'
  messages: DialogMessage[]
}

// 用户进度
export interface UserProgress {
  totalRestrain: number
  totalRelapse: number
  currentStreak: number
  bestStreak: number
  lastEventDate: string | null
  dailyQuoteCount: number
}

// 统计快照
export interface StatsSnapshot {
  totalRestrain: number
  totalRelapse: number
  successRate: number
  currentStreak: number
  bestStreak: number
  dailyQuoteCount: number
  triggerDistribution: { trigger: TriggerType; count: number }[]
  trend30: { date: string; restrain: number; relapse: number }[]
}

// 情绪诱因文案映射
export const TRIGGER_LABELS: Record<TriggerType, string> = {
  anxiety: '焦虑',
  loneliness: '孤独',
  fatigue: '疲惫',
  boredom: '无聊',
  stress: '压力',
  craving: '欲望',
  other: '其他',
}

export const TRIGGER_COLORS: Record<TriggerType, string> = {
  anxiety: '#E8B4A0',
  loneliness: '#9B8FA8',
  fatigue: '#D4B896',
  boredom: '#8FA89B',
  stress: '#DD9A82',
  craving: '#C4BACE',
  other: '#BFCDC4',
}

const TRIGGER_OPTIONS = [
  { value: 'anxiety', label: '焦虑', emoji: '🌊' },
  { value: 'stress', label: '压力', emoji: '⛰️' },
  { value: 'loneliness', label: '孤独', emoji: '🌙' },
  { value: 'fatigue', label: '疲惫', emoji: '🌫️' },
  { value: 'boredom', label: '无聊', emoji: '🍃' },
  { value: 'craving', label: '欲望', emoji: '🔥' },
  { value: 'other', label: '其他', emoji: '✨' },
]

module.exports = {
  TRIGGER_LABELS,
  TRIGGER_COLORS,
  TRIGGER_OPTIONS,
}
