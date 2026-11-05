import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

/**
 * Session state for UI affordances (header account button, reservation gates).
 * The root route owns cache invalidation on auth changes; this hook only mirrors
 * the current user into component state so a header never shows a stale "Entrar".
 */
export function useSession() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}

export function accountName(user: User) {
  const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string }
  return (meta.full_name || meta.name || user.email || 'Cliente').trim()
}

export function accountInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || 'CL'
}
