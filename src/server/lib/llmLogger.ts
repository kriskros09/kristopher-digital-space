// This logger utility uses the Supabase service role key for server-side logging only.
// NEVER import or use this file in client-side code or React components.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side only Supabase client
const supabaseServer = createClient(supabaseUrl, serviceRoleKey)

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
  const { error } = await supabaseServer.from('llm_logs').insert([entry])
  if (error) console.error('Supabase log insert error:', error)
}

export async function getLlmLogs() {
  const { data, error } = await supabaseServer
    .from('llm_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100)
  if (error) throw error
  return data
}

export async function deleteAllLlmLogs() {
  const { error } = await supabaseServer.from('llm_logs').delete().neq('id', ''); // delete all rows
  if (error) throw error;
} 