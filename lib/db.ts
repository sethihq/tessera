import { createClient } from "@/lib/supabase/client"

export const db = createClient()

// Re-export common database operations for convenience
export const getUser = async () => {
  const {
    data: { user },
  } = await db.auth.getUser()
  return user
}

export const signOut = async () => {
  const { error } = await db.auth.signOut()
  return { error }
}
