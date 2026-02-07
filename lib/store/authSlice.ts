"use client"

import { createSlice } from "@reduxjs/toolkit"
import type { User } from "@supabase/supabase-js"

export type Role =
  | "developer"
  | "hr"
  | "admin"
  | "company"
  | "company_admin"
  | "platform_admin"
  | "mt"
  | null

export interface AuthState {
  user: User | null
  role: Role
  loading: boolean
}

const initialState: AuthState = {
  user: null,
  role: null,
  loading: true,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: { payload: User | null }) => {
      state.user = action.payload
      state.loading = false
      if (!action.payload) state.role = null
    },
    setRole: (state, action: { payload: Role }) => {
      state.role = action.payload
    },
    setLoading: (state, action: { payload: boolean }) => {
      state.loading = action.payload
    },
    logout: (state) => {
      state.user = null
      state.role = null
      state.loading = false
    },
  },
})

export const { setUser, setRole, setLoading, logout: logoutAction } = authSlice.actions
export default authSlice.reducer
