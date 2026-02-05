import { DailyRecord, Progress } from '../types';

export function getWeekDateRange(): { start: string; end: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - diff);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0]
  };
}

export function getMonthDateRange(): { start: string; end: string } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0]
  };
}

export function getLast7Days(): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
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
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function getDayOfWeek(dateString: string): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const date = new Date(dateString);
  return days[date.getDay()];
}
