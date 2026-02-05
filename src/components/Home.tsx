import { useEffect, useState } from 'react';
import { Heart, Beer, HelpCircle } from 'lucide-react';
import { DailyRecord, DayStatus, Goals, Progress } from '../types';
import { getTodayRecord, upsertDailyRecord, getRecordsForDateRange, getGoals } from '../lib/db';
import { getWeekDateRange, getMonthDateRange, getLast7Days, calculateProgress, formatDate, getDayOfWeek } from '../lib/utils';

export default function Home() {
  const [todayStatus, setTodayStatus] = useState<DayStatus>('unset');
  const [weekProgress, setWeekProgress] = useState<Progress>({ current: 0, target: 2, percentage: 0 });
  const [monthProgress, setMonthProgress] = useState<Progress>({ current: 0, target: 8, percentage: 0 });
  const [last7Days, setLast7Days] = useState<{ date: string; status: DayStatus }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const today = await getTodayRecord();
      setTodayStatus(today?.status || 'unset');

      const goals = await getGoals();
      const weeklyGoal = goals?.weekly_goal || 2;
      const monthlyGoal = goals?.monthly_goal || 8;

      const weekRange = getWeekDateRange();
      const weekRecords = await getRecordsForDateRange(weekRange.start, weekRange.end);
      setWeekProgress(calculateProgress(weekRecords, weeklyGoal));

      const monthRange = getMonthDateRange();
      const monthRecords = await getRecordsForDateRange(monthRange.start, monthRange.end);
      setMonthProgress(calculateProgress(monthRecords, monthlyGoal));

      const dates = getLast7Days();
      const dateMap = new Map(weekRecords.map(r => [r.date, r.status]));
      setLast7Days(dates.map(date => ({
        date,
        status: dateMap.get(date) || 'unset'
      })));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (status: DayStatus) => {
    const today = new Date().toISOString().split('T')[0];
    await upsertDailyRecord(today, status);
    setTodayStatus(status);
    await loadData();
  };

  const getStatusColor = (status: DayStatus) => {
    switch (status) {
      case 'rest': return 'bg-green-400';
      case 'drink': return 'bg-orange-400';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: DayStatus) => {
    switch (status) {
      case 'rest': return <Heart className="w-12 h-12" />;
      case 'drink': return <Beer className="w-12 h-12" />;
      default: return <HelpCircle className="w-12 h-12" />;
    }
  };

  const getStatusText = (status: DayStatus) => {
    switch (status) {
      case 'rest': return '休肝日';
      case 'drink': return '飲酒';
      default: return '未入力';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-2xl text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">今日の記録</h2>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleStatusChange('rest')}
            className={`flex-1 py-8 rounded-2xl transition-all ${
              todayStatus === 'rest'
                ? 'bg-green-400 text-white scale-105 shadow-xl'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Heart className="w-12 h-12" />
              <span className="text-xl font-bold">休肝日</span>
            </div>
          </button>
          <button
            onClick={() => handleStatusChange('drink')}
            className={`flex-1 py-8 rounded-2xl transition-all ${
              todayStatus === 'drink'
                ? 'bg-orange-400 text-white scale-105 shadow-xl'
                : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Beer className="w-12 h-12" />
              <span className="text-xl font-bold">飲酒</span>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">今週の目標</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span>休肝日</span>
            <span className="text-green-600 font-bold">
              {weekProgress.current} / {weekProgress.target}日
            </span>
          </div>
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${weekProgress.percentage}%` }}
            >
              {weekProgress.percentage > 20 && (
                <span className="text-white text-xs font-bold">{Math.round(weekProgress.percentage)}%</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">今月の目標</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span>休肝日</span>
            <span className="text-blue-600 font-bold">
              {monthProgress.current} / {monthProgress.target}日
            </span>
          </div>
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${monthProgress.percentage}%` }}
            >
              {monthProgress.percentage > 20 && (
                <span className="text-white text-xs font-bold">{Math.round(monthProgress.percentage)}%</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">最近7日間</h3>
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map(({ date, status }) => (
            <div key={date} className="flex flex-col items-center gap-1">
              <div className={`w-12 h-12 rounded-xl ${getStatusColor(status)} flex items-center justify-center transition-all shadow-md`}>
                <span className="text-white text-xs">{formatDate(date).split('/')[1]}</span>
              </div>
              <span className="text-xs text-gray-500">{getDayOfWeek(date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
