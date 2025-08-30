"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export const supabase = createClient()

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const useSession = () => {
  const [session, setSession] = useState<{ user: User } | null>(null)
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setIsPending(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setIsPending(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { data: session, isPending }
}
