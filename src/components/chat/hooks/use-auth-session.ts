import { useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/supabase/supabase-client"
import type { ChatUserSession } from "@/types/chat"

const serializeUserSession = (session: Session | null): ChatUserSession | null => {
  const user = session?.user
  if (!user) return null

  return {
    id: user.id,
    email: user.email ?? null,
    displayName:
      typeof user.user_metadata?.display_name === "string"
        ? user.user_metadata.display_name
        : typeof user.user_metadata?.username === "string"
          ? user.user_metadata.username
          : null,
    provider:
      typeof user.app_metadata?.provider === "string"
        ? user.app_metadata.provider
        : null,
    lastSignInAt: user.last_sign_in_at ?? null,
  }
}

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null)
  const [sessionInfo, setSessionInfo] = useState<ChatUserSession | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchUser() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setUser(data.session?.user ?? null)
      setSessionInfo(serializeUserSession(data.session ?? null))
      setAccessToken(data.session?.access_token ?? null)
      setLoading(false)
    }

    void fetchUser()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setSessionInfo(serializeUserSession(session ?? null))
      setAccessToken(session?.access_token ?? null)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return { user, loading, sessionInfo, accessToken }
}
