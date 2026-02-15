export type DayStatus = 'rest' | 'drink' | 'unset';

export interface DailyRecord {
  id: string;
  user_id?: string;
  date: string;
  status: DayStatus;
  created_at: string;
  updated_at: string;
}

export interface Goals {
  id: string;
  user_id?: string;
  weekly_goal: number;
  monthly_goal: number;
  character_level?: number;
  created_at: string;
  updated_at: string;
}

export const CHARACTER_LEVEL_NAMES: Record<number, string> = {
  1: 'ほろ酔い',
  2: '軽い疲れ',
  3: '疲れピーク',
  4: '回復開始',
  5: '安定',
  6: '元気',
  7: 'いい感じ',
  8: '健康オーラ',
  9: '絶好調',
  10: 'スーパー元気'
};

export interface Progress {
  current: number;
  target: number;
  percentage: number;
}

export type AiMessageType = 'weekly_summary' | 'encouragement' | 'daily_tip';

export interface AiMessage {
  id: string;
  message_type: AiMessageType;
  content: string;
  created_at: string;
}
