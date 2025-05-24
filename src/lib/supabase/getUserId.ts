import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getUserIdSafe(): Promise<string | undefined> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error && error.status === 400 && error.code === 'refresh_token_not_found') {
      return undefined;
    }
    return user?.id;
  } catch (err) {
    console.error('[getUserIdSafe] Failed to get user ID:', err);
    return undefined;
  }
} 