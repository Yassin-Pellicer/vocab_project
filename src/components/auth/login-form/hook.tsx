import { useState, useEffect, useCallback } from "react"
import { User } from "@supabase/supabase-js"

import { supabase } from "@/supabase/supabase-client"

type SignInParams = {
  email: string
  password: string
}

type SignUpParams = {
  email: string
  username: string
  password: string
}

type AuthHook = {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (params: SignInParams) => Promise<void>
  signUp: (params: SignUpParams) => Promise<void>
  signInWithOAuth: (provider?: "google" | "github") => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  signOut: () => Promise<void>
}

export function useAuth(): AuthHook {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async ({ email, password }: SignInParams) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      setUser(data.user)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async ({ email, username, password }: SignUpParams) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      })

      if (error) throw error

      setUser(data.user)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithOAuth = useCallback(
    async (provider: "google" | "github" = "google") => {
      setLoading(true)
      setError(null)

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider
        })

        if (error) throw error
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return true
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithOAuth,
    resetPassword,
    signOut
  }
}
