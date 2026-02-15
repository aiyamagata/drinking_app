import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function toJstDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function getWeekRange(dateString: string): { start: string; end: string } {
  const [year, month, day] = dateString.split('-').map(Number);
  const dateUtc = new Date(Date.UTC(year, (month || 1) - 1, day || 1));
  const dayOfWeek = dateUtc.getUTCDay(); // 0: Sun
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday start

  const monday = new Date(dateUtc);
  monday.setUTCDate(dateUtc.getUTCDate() - diff);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const start = monday.toISOString().slice(0, 10);
  const end = sunday.toISOString().slice(0, 10);
  return { start, end };
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Use POST' }, 405);
  }

  if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Missing required secrets' }, 500);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const todayJst = toJstDateString();
  const weekRange = getWeekRange(todayJst);

  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (goalsError) {
    return jsonResponse({ error: goalsError.message }, 500);
  }

  const weeklyTarget = goals?.weekly_goal ?? 2;

  const { data: records, error: recordsError } = await supabase
    .from('daily_records')
    .select('date, status')
    .gte('date', weekRange.start)
    .lte('date', weekRange.end);

  if (recordsError) {
    return jsonResponse({ error: recordsError.message }, 500);
  }

  const restDays = (records || []).filter(record => record.status === 'rest').length;

  const prompt = `
あなたは「ギャルっぽく、優しく励ます」友達です。
進捗に応じてギャルっぽい励ましの言葉を3つ生成してください。
お酒に無理に絡めなくてOK。進捗や頑張りにフォーカスして、短く軽く励まして。

条件:
- 日本語
- 1文〜2文
- 説教しない
- 明るい/軽いノリ
- 「えぐい」「マジ」「〜だよ」などのギャル語OK
- 進捗に対しての励まし・ねぎらいに徹する

入力:
- 今日は ${todayJst}
- 今週の休肝日数: ${restDays}日
- 今週の目標: ${weeklyTarget}日

- weekly_summary: 今週の進捗を一言で（例: 今週2/3日達成中！）
- encouragement: 進捗に合わせた励まし（目標達成なら祝福、まだなら「できてるのえぐい」系）
- daily_tip: 今日の1文。生活全般・休息・ペース配分など、進捗に関連した短い励まし

出力は必ず次のJSONのみ:
{
  "weekly_summary": "...",
  "encouragement": "...",
  "daily_tip": "..."
}
  `.trim();

  const aiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: prompt,
      text: {
        format: { type: 'json_object' }
      }
    })
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    return jsonResponse({ error: errorText }, 500);
  }

  const aiJson = await aiResponse.json();
  const outputText = aiJson.output_text ?? aiJson?.output?.[0]?.content?.[0]?.text ?? '';

  let parsed: { weekly_summary: string; encouragement: string; daily_tip: string };
  try {
    parsed = JSON.parse(outputText);
  } catch {
    return jsonResponse({ error: 'Invalid AI response format', raw: outputText }, 500);
  }

  const { error: insertError } = await supabase.from('ai_messages').insert([
    { message_type: 'weekly_summary', content: parsed.weekly_summary },
    { message_type: 'encouragement', content: parsed.encouragement },
    { message_type: 'daily_tip', content: parsed.daily_tip }
  ]);

  if (insertError) {
    return jsonResponse({ error: insertError.message }, 500);
  }

  return jsonResponse({
    ok: true,
    message: 'AI messages generated',
    data: parsed
  });
});
