import { supabase } from './supabase';
import { AiMessage, AiMessageType, DailyRecord, DayStatus, Goals } from '../types';
import { toLocalDateString } from './utils';

export async function getTodayRecord(userId: string): Promise<DailyRecord | null> {
  const today = toLocalDateString();
  const { data, error } = await supabase
    .from('daily_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertDailyRecord(userId: string, date: string, status: DayStatus): Promise<void> {
  const { error } = await supabase
    .from('daily_records')
    .upsert(
      { user_id: userId, date, status, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' }
    );

  if (error) throw error;
}

export async function getRecordsForDateRange(userId: string, startDate: string, endDate: string): Promise<DailyRecord[]> {
  const { data, error } = await supabase
    .from('daily_records')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getGoals(userId: string): Promise<Goals | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const { data: inserted, error: insertError } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        weekly_goal: 2,
        monthly_goal: 8,
        character_level: 1
      })
      .select('*')
      .single();

    if (insertError) throw insertError;
    return inserted;
  }

  return data;
}

export async function updateGoals(userId: string, weeklyGoal: number, monthlyGoal: number): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .upsert({
      user_id: userId,
      weekly_goal: weeklyGoal,
      monthly_goal: monthlyGoal,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) throw error;
}

export async function getLatestAiMessages(): Promise<Record<AiMessageType, string> | null> {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const latestByType: Partial<Record<AiMessageType, AiMessage>> = {};

  data.forEach(message => {
    const type = message.message_type as AiMessageType;
    if (!latestByType[type]) {
      latestByType[type] = message as AiMessage;
    }
  });

  const result: Partial<Record<AiMessageType, string>> = {};
  (['weekly_summary', 'encouragement', 'daily_tip'] as AiMessageType[]).forEach(type => {
    const msg = latestByType[type];
    if (msg) result[type] = msg.content;
  });

  if (Object.keys(result).length === 0) return null;
  return result as Record<AiMessageType, string>;
}

export async function getMonthRecords(userId: string, year: number, month: number): Promise<DailyRecord[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = toLocalDateString(new Date(year, month, 0));
  return getRecordsForDateRange(userId, startDate, endDate);
}

export async function updateCharacterLevel(userId: string, level: number): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .update({
      character_level: Math.min(10, Math.max(1, level)),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) throw error;
}
