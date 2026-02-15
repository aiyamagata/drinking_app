import { DailyRecord, Progress } from '../types';

export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

const DAILY_TIPS = [
  '今日もちょっとずつ積み重ねてるのえぐい！',
  '無理しないのが一番の近道だよ〜',
  '進んでる感、マジで尊い。',
  '昨日より今日の自分、ちょっとマシになってるはず。',
  'たまには休むのも大事な仕事だよ。',
  '頑張りすぎてたら今日はゆるめていこ。',
  'コツコツ派は最終的に勝つってマジ。',
  '自分のペースでいこ、急がなくてOK。',
  '1日1ミリでも前に進んでたら御の字だよ。',
  '完璧じゃなくてよくて、続いてることがすごい。'
];

export function getDailyTip(dateString: string = toLocalDateString()): string {
  const hash = dateString.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = hash % DAILY_TIPS.length;
  return DAILY_TIPS[index];
}

export function getWeeklySummary(progress: Progress): string {
  return `今週の休肝：${progress.current}/${progress.target}日`;
}

export function getEncouragement(progress: Progress): string {
  const { current, target } = progress;
  if (target <= 0) {
    return '目標0日なら、今週は自由でOK！';
  }
  if (current === 0) {
    return '今週まだ0日だけど、1日始めれば勝ち確だよ〜';
  }
  const remaining = Math.max(target - current, 0);
  if (remaining === 0) {
    return '目標達成！マジでえぐい、尊敬する。';
  }
  if (current >= target * 0.8) {
    return `あとちょっと！${current}日もできてるのマジすごい。`;
  }
  return `${current}日できてるのえぐい。あと${remaining}日でいこ〜`;
}

export function getWeekDateRange(): { start: string; end: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - diff);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: toLocalDateString(monday),
    end: toLocalDateString(sunday)
  };
}

export function getMonthDateRange(): { start: string; end: string } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    start: toLocalDateString(firstDay),
    end: toLocalDateString(lastDay)
  };
}

export function getLast7Days(): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(toLocalDateString(date));
  }

  return dates;
}

/** 休肝日数からキャラレベルを算出（1〜10、休肝1日で+1、飲酒は維持） */
export function calculateCharacterLevel(totalRestDays: number): number {
  return Math.min(10, Math.max(1, 1 + totalRestDays));
}

export function calculateProgress(records: DailyRecord[], target: number): Progress {
  const restDays = records.filter(r => r.status === 'rest').length;
  const percentage = target > 0 ? Math.min((restDays / target) * 100, 100) : 0;

  return {
    current: restDays,
    target,
    percentage
  };
}

export function formatDate(dateString: string): string {
  const date = parseLocalDateString(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function getDayOfWeek(dateString: string): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const date = parseLocalDateString(dateString);
  return days[date.getDay()];
}
