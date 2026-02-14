"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createClient } from "@/lib/supabase/client"
import type { RootState } from "@/lib/store"
import type { Role } from "@/lib/store/authSlice"
import { setUser, setRole, setLoading, logoutAction } from "@/lib/store/authSlice"

const supabase = createClient()
let authInitialized = false

async function fetchUserRole(userId: string): Promise<Role> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()
    return (profile?.role as Role) || "developer"
  } catch (error) {
    console.error("Profile fetch error:", error)
    return "developer"
  }
}

function initAuth(dispatch: ReturnType<typeof useDispatch>) {
  if (authInitialized) return
  authInitialized = true

  supabase.auth.getUser().then(({ data: { user } }) => {
    dispatch(setUser(user))
    if (user) {
      fetchUserRole(user.id).then((role) => dispatch(setRole(role)))
    }
  }).catch(() => {
    dispatch(setLoading(false))
  })

  supabase.auth.onAuthStateChange(async (_event, session) => {
    const currentUser = session?.user ?? null
    dispatch(setUser(currentUser))
    if (currentUser) {
      const role = await fetchUserRole(currentUser.id)
      dispatch(setRole(role))
    }
  })
}

export function useAuth() {
  const dispatch = useDispatch()
  const { user, role, loading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    initAuth(dispatch)
  }, [dispatch])

  const logout = async () => {
    await supabase.auth.signOut()
    dispatch(logoutAction())
  }

  return {
    user,
    role,
    loading,
    logout,
  }
}

export type { Role }
