import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useSupabaseUserInfo() {
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchUser() {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          if (error.status === 400 && error.code === 'refresh_token_not_found') {
            await supabase.auth.signOut()
            window.location.href = '/auth/login'
            return
          }
        }
        if (isMounted) {
          setUser({
            email: data.user?.email,
            name: data.user?.user_metadata?.name,
          })
        }
      } catch (err) {
        console.error("[useSupabaseUserInfo] Error fetching user info:", err);
        // fallback: handle unexpected errors
        setUser(null)
      }
    }

    fetchUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        window.location.href = '/auth/login'
      } else {
        setUser({
          email: session.user?.email,
          name: session.user?.user_metadata?.name,
        })
      }
    })

    return () => {
      isMounted = false
      listener?.subscription.unsubscribe()
    }
  }, [])

  return user
} 