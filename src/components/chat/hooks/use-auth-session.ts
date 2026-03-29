import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/supabase/supabase-client"

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchUser() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setUser(data.session?.user ?? null)
      setLoading(false)
    }

    void fetchUser()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}

