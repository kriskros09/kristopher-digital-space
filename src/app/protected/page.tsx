import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/ui/login/logout-button'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient()

  try {
    const { data, error } = await supabase.auth.getUser()
    if (error && error.status === 400 && error.code === 'refresh_token_not_found') {
      redirect('/auth/login')
    }
    const userEmail = data.user?.email || ''
    return (
      <div className="flex h-svh w-full items-center justify-center gap-2">
        <p>
          Hello <span>{userEmail}</span>
        </p>
        <LogoutButton />
      </div>
    )
  } catch (err) {
    console.error(err);
    redirect('/auth/login')
  }
}
