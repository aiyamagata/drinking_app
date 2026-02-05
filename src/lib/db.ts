import { supabase } from './supabase';
import { DailyRecord, DayStatus, Goals } from '../types';

export async function getTodayRecord(): Promise<DailyRecord | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_records')
    .select('*')
    .eq('date', today)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertDailyRecord(date: string, status: DayStatus): Promise<void> {
  const { error } = await supabase
    .from('daily_records')
    .upsert(
      { date, status, updated_at: new Date().toISOString() },
      { onConflict: 'date' }
    );

  if (error) throw error;
}

export async function getRecordsForDateRange(startDate: string, endDate: string): Promise<DailyRecord[]> {
  const { data, error } = await supabase
    .from('daily_records')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getGoals(): Promise<Goals | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateGoals(weeklyGoal: number, monthlyGoal: number): Promise<void> {
  const existingGoals = await getGoals();

  if (existingGoals) {
    const { error } = await supabase
      .from('goals')
      .update({
        weekly_goal: weeklyGoal,
        monthly_goal: monthlyGoal,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingGoals.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('goals')
      .insert({ weekly_goal: weeklyGoal, monthly_goal: monthlyGoal });

    if (error) throw error;
  }
}

export async function getMonthRecords(year: number, month: number): Promise<DailyRecord[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  return getRecordsForDateRange(startDate, endDate);
}
