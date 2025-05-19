
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface LlmLogEntry {
  timestamp: string
  user_id?: string
  route: string
  prompt: string
  response: string
  status: string
  error?: string
}

export async function logLlmInteraction(entry: LlmLogEntry) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('llm_logs').insert([entry])
  if (error) console.error('Supabase log insert error:', error)
}

export async function getLlmLogs() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('llm_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100)
  if (error) throw error
  return data
}

export async function deleteAllLlmLogs() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('llm_logs').delete().not('id', 'is', null); // delete all rows
  if (error) {
    console.error('Delete error:', error);
    throw error;
  }
  console.log('Deleted rows:', data);
} 