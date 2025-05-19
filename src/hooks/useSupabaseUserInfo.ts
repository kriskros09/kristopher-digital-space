import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useSupabaseUserInfo() {
  const [user, setUser] = useState<{ email?: string; name?: string }>({})
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser({
        email: data.user?.email,
        name: data.user?.user_metadata?.name,
      })
    })
  }, [])
  return user
} 