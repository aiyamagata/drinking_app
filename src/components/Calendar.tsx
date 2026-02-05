import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Beer, HelpCircle } from 'lucide-react';
import { DayStatus } from '../types';
import { getMonthRecords, upsertDailyRecord } from '../lib/db';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<Map<string, DayStatus>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMonthData = async (date: Date) => {
    try {
      setLoading(true);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const data = await getMonthRecords(year, month);
      const recordMap = new Map(data.map(r => [r.date, r.status]));
      setRecords(recordMap);
    } catch (error) {
      console.error('Failed to load month data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonthData(currentDate);
  }, [currentDate]);

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const paddingDate = new Date(year, month, -i);
      days.push(paddingDate);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
  };

  const handleStatusSelect = async (status: DayStatus) => {
    if (selectedDate) {
      await upsertDailyRecord(selectedDate, status);
      await loadMonthData(currentDate);
      setSelectedDate(null);
    }
  };

  const getStatusColor = (status: DayStatus | undefined) => {
    switch (status) {
      case 'rest': return 'bg-green-400 text-white';
      case 'drink': return 'bg-orange-400 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">読み込み中...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              const dateString = date.toISOString().split('T')[0];
              const status = records.get(dateString);
              const isOtherMonth = !isCurrentMonth(date);

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  disabled={isOtherMonth}
                  className={`
                    aspect-square rounded-xl transition-all
                    ${getStatusColor(status)}
                    ${isOtherMonth ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 shadow-md'}
                    ${isToday(date) && !isOtherMonth ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-sm font-medium">{date.getDate()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedDate(null)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 m-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              {selectedDate} の記録
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleStatusSelect('rest')}
                className="w-full py-4 rounded-2xl bg-green-400 text-white hover:bg-green-500 transition-all shadow-md hover:shadow-lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-6 h-6" />
                  <span className="text-lg font-bold">休肝日</span>
                </div>
              </button>
              <button
                onClick={() => handleStatusSelect('drink')}
                className="w-full py-4 rounded-2xl bg-orange-400 text-white hover:bg-orange-500 transition-all shadow-md hover:shadow-lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <Beer className="w-6 h-6" />
                  <span className="text-lg font-bold">飲酒</span>
                </div>
              </button>
              <button
                onClick={() => handleStatusSelect('unset')}
                className="w-full py-4 rounded-2xl bg-gray-300 text-gray-700 hover:bg-gray-400 transition-all shadow-md hover:shadow-lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <HelpCircle className="w-6 h-6" />
                  <span className="text-lg font-bold">未入力</span>
                </div>
              </button>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
