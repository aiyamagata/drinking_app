export type DayStatus = 'rest' | 'drink' | 'unset';

export interface DailyRecord {
  id: string;
  date: string;
  status: DayStatus;
  created_at: string;
  updated_at: string;
}

export interface Goals {
  id: string;
  weekly_goal: number;
  monthly_goal: number;
  created_at: string;
  updated_at: string;
}

export interface Progress {
  current: number;
  target: number;
  percentage: number;
}
