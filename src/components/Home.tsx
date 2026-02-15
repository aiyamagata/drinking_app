import { useEffect, useState } from 'react';
import { Heart, Beer, HelpCircle } from 'lucide-react';
import { DayStatus, Progress } from '../types';
import { getTodayRecord, upsertDailyRecord, getRecordsForDateRange, getGoals, getLatestAiMessages, updateCharacterLevel } from '../lib/db';
import { getWeekDateRange, getMonthDateRange, getLast7Days, calculateProgress, formatDate, getDayOfWeek, toLocalDateString, getDailyTip, getWeeklySummary, getEncouragement, calculateCharacterLevel } from '../lib/utils';
import Character from './Character';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [todayStatus, setTodayStatus] = useState<DayStatus>('unset');
  const [weekProgress, setWeekProgress] = useState<Progress>({ current: 0, target: 2, percentage: 0 });
  const [monthProgress, setMonthProgress] = useState<Progress>({ current: 0, target: 8, percentage: 0 });
  const [last7Days, setLast7Days] = useState<{ date: string; status: DayStatus }[]>([]);
  const [aiMessages, setAiMessages] = useState<Record<'weekly_summary' | 'encouragement' | 'daily_tip', string> | null>(null);
  const [characterLevel, setCharacterLevel] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const today = await getTodayRecord(userId);
      setTodayStatus(today?.status || 'unset');

      const goals = await getGoals(userId);
      const weeklyGoal = goals?.weekly_goal || 2;
      const monthlyGoal = goals?.monthly_goal || 8;

      const weekRange = getWeekDateRange();
      const weekRecords = await getRecordsForDateRange(userId, weekRange.start, weekRange.end);
      setWeekProgress(calculateProgress(weekRecords, weeklyGoal));

      const monthRange = getMonthDateRange();
      const monthRecords = await getRecordsForDateRange(userId, monthRange.start, monthRange.end);
      setMonthProgress(calculateProgress(monthRecords, monthlyGoal));

      const restCountThisMonth = monthRecords.filter(r => r.status === 'rest').length;
      const level = calculateCharacterLevel(restCountThisMonth);
      await updateCharacterLevel(userId, level);
      setCharacterLevel(level);

      const dates = getLast7Days();
      const dateMap = new Map(weekRecords.map(r => [r.date, r.status]));
      setLast7Days(dates.map(date => ({
        date,
        status: dateMap.get(date) || 'unset'
      })));

      const latestAi = await getLatestAiMessages();
      setAiMessages(latestAi);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleStatusChange = async (status: DayStatus) => {
    if (!userId) return;
    const today = toLocalDateString();
    await upsertDailyRecord(userId, today, status);
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

  const todayLocal = toLocalDateString();
  const dailyTip = aiMessages?.daily_tip ?? getDailyTip(todayLocal);
  const weeklySummary = aiMessages?.weekly_summary ?? getWeeklySummary(weekProgress);
  const encouragement = aiMessages?.encouragement ?? getEncouragement(weekProgress);

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center">
        <Character level={characterLevel}
        imageSrcByLevel={{
          1: '/images/level1.png',
          2: '/images/level2.png',
          3: '/images/level3.png',
          4: '/images/level4.png',
          5: '/images/level5.png',
          6: '/images/level6.png',
          7: '/images/level7.png',
          8: '/images/level8.png',
          9: '/images/level9.png',
          10: '/images/level10.png'
        }}
        />
      </div>

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
        <p className="text-sm text-gray-600">{weeklySummary}</p>
        <p className="text-base font-bold text-gray-800 mt-2">{encouragement}</p>
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-pink-50 to-yellow-50 p-4">
          <div className="text-xs font-bold text-gray-500 mb-1">今日の1文</div>
          <div className="text-sm text-gray-700">{dailyTip}</div>
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
