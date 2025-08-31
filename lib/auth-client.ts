"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return { user, session, loading }
}

export function useSession() {
  const { user, session, loading } = useAuth()

  return {
    data: session,
    isPending: loading,
  }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
    },
  })
}

export async function signOut() {
  const supabase = createClient()
  return await supabase.auth.signOut()
}
