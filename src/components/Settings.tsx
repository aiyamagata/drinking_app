import { useEffect, useState } from 'react';
import { Target, Save } from 'lucide-react';
import { getGoals, updateGoals } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [weeklyGoal, setWeeklyGoal] = useState(2);
  const [monthlyGoal, setMonthlyGoal] = useState(8);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadGoals = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const goals = await getGoals(userId);
      if (goals) {
        setWeeklyGoal(goals.weekly_goal);
        setMonthlyGoal(goals.monthly_goal);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    try {
      setSaving(true);
      await updateGoals(userId, weeklyGoal, monthlyGoal);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save goals:', error);
    } finally {
      setSaving(false);
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
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">目標設定</h2>
        </div>

        <div className="space-y-6">
          <div className="bg-green-50 rounded-2xl p-6">
            <label className="block text-lg font-bold text-gray-800 mb-4">
              週の休肝日目標
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="7"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                className="flex-1 h-3 bg-green-200 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(74, 222, 128) 0%, rgb(74, 222, 128) ${(weeklyGoal / 7) * 100}%, rgb(187, 247, 208) ${(weeklyGoal / 7) * 100}%, rgb(187, 247, 208) 100%)`
                }}
              />
              <div className="w-20 text-center">
                <span className="text-3xl font-bold text-green-600">{weeklyGoal}</span>
                <span className="text-sm text-gray-600 ml-1">/ 7日</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              1週間に{weeklyGoal}日の休肝日を目指します
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6">
            <label className="block text-lg font-bold text-gray-800 mb-4">
              月の休肝日目標
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="31"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                className="flex-1 h-3 bg-blue-200 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(96, 165, 250) 0%, rgb(96, 165, 250) ${(monthlyGoal / 31) * 100}%, rgb(191, 219, 254) ${(monthlyGoal / 31) * 100}%, rgb(191, 219, 254) 100%)`
                }}
              />
              <div className="w-20 text-center">
                <span className="text-3xl font-bold text-blue-600">{monthlyGoal}</span>
                <span className="text-sm text-gray-600 ml-1">/ 31日</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              1ヶ月に{monthlyGoal}日の休肝日を目指します
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`
            w-full mt-6 py-4 rounded-2xl font-bold text-white text-lg
            transition-all shadow-lg hover:shadow-xl
            ${saved
              ? 'bg-green-500'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            }
            ${saving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <Save className="w-6 h-6" />
            <span>{saved ? '保存しました！' : saving ? '保存中...' : '目標を保存'}</span>
          </div>
        </button>
      </div>

      <div className="bg-gradient-to-br from-pink-50 to-yellow-50 rounded-3xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">休肝日のメリット</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>肝臓を休ませることで健康維持</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>睡眠の質が向上</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>翌日のパフォーマンス向上</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>お酒をより美味しく楽しめる</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
