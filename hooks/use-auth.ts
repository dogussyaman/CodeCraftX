 "use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type Role =
  | "developer"
  | "hr"
  | "admin"
  | "company"
  | "company_admin"
  | "platform_admin"
  | "mt"
  | null;

type AuthState = {
  user: User | null;
  role: Role;
  loading: boolean;
};

const supabase = createClient();

let state: AuthState = {
  user: null,
  role: null,
  loading: true,
};

const listeners = new Set<(state: AuthState) => void>();
let initialized = false;

const notify = () => {
  for (const listener of listeners) {
    listener(state);
  }
};

const setState = (partial: Partial<AuthState>) => {
  state = { ...state, ...partial };
  notify();
};

const fetchUserRole = async (userId: string) => {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    setState({
      role: (profile?.role as Role) || "developer",
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    setState({ role: "developer" });
  }
};

const initAuth = async () => {
  if (initialized) return;
  initialized = true;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setState({
      user,
      loading: false,
    });

    if (user) {
      fetchUserRole(user.id).catch((error) => {
        console.error("Role fetch error:", error);
      });
    }
  } catch (error) {
    console.error("Auth initialization error:", error);
    setState({ loading: false });
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    const currentUser = session?.user || null;

    setState({
      user: currentUser,
      loading: false,
      role: currentUser ? state.role : null,
    });

    if (currentUser) {
      fetchUserRole(currentUser.id).catch((error) => {
        console.error("Role fetch error:", error);
      });
    }
  });

  // Supabase kendi içinde unsubscribe handle ediyor; burada sadece referans tutuyoruz.
  // Uygulama yaşam döngüsü boyunca auth dinleyicisinin açık kalması bizim için yeterli.
  return subscription;
};

const logout = async () => {
  await supabase.auth.signOut();
  setState({
    user: null,
    role: null,
    loading: false,
  });
};

export function useAuth() {
  const [localState, setLocalState] = useState<AuthState>(state);

  useEffect(() => {
    listeners.add(setLocalState);
    void initAuth();

    return () => {
      listeners.delete(setLocalState);
    };
  }, []);

  return {
    ...localState,
    logout,
  };
}

