// 核心数据类型定义

// 情绪诱因类型
export type TriggerType =
  | "anxiety"
  | "loneliness"
  | "fatigue"
  | "boredom"
  | "stress"
  | "craving"
  | "other";

// 事件记录：克制成功 / 放纵
export interface EventRecord {
  id: string;
  timestamp: number;
  type: "restrain" | "relapse";
  trigger: TriggerType;
  scenario: string; // 当时的冲动场景
  outcomeNote: string; // 结局感受/笔记
  relatedTradeoffId?: string; // 关联的权衡笔记
}

// 得失权衡笔记
export interface TradeoffNote {
  id: string;
  timestamp: number;
  longGoal: string; // 长期真正想达成的目标
  requirements: string[]; // 实现目标的必备条件
  sacrifices: string[]; // 需要主动舍弃的短期享乐
  shortGain: string; // 短期快感描述
  longReward: string; // 长期收益描述
}

// 对话消息
export interface DialogMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

// 对话会话
export interface DialogSession {
  id: string;
  timestamp: number;
  trigger: TriggerType | "none";
  messages: DialogMessage[];
}

// 用户进度
export interface UserProgress {
  totalRestrain: number;
  totalRelapse: number;
  currentStreak: number; // 当前连胜
  bestStreak: number; // 历史最佳连胜
  lastEventDate: string | null; // YYYY-MM-DD
  dailyQuoteCount: number; // 日签使用次数
}

// 统计快照
export interface StatsSnapshot {
  totalRestrain: number;
  totalRelapse: number;
  successRate: number;
  currentStreak: number;
  bestStreak: number;
  dailyQuoteCount: number;
  triggerDistribution: { trigger: TriggerType; count: number }[];
  trend30: { date: string; restrain: number; relapse: number }[];
}

// 元数据：加密配置
export interface MetaRecord {
  encrypted: boolean;
  salt?: string; // base64
  iv?: string; // base64 (固定 iv 复用，简化演示)
  pinHash?: string; // 校验用
}

// 情绪诱因文案映射
export const TRIGGER_LABELS: Record<TriggerType, string> = {
  anxiety: "焦虑",
  loneliness: "孤独",
  fatigue: "疲惫",
  boredom: "无聊",
  stress: "压力",
  craving: "欲望",
  other: "其他",
};

export const TRIGGER_COLORS: Record<TriggerType, string> = {
  anxiety: "#E8B4A0",
  loneliness: "#9B8FA8",
  fatigue: "#D4B896",
  boredom: "#8FA89B",
  stress: "#DD9A82",
  craving: "#C4BACE",
  other: "#BFCDC4",
};
