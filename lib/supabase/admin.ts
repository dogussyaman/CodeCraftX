import { createClient } from "@supabase/supabase-js"

/**
 * Service-role Supabase client
 * Sadece server-side (API routes, server actions) içinde kullanın.
 * Kesinlikle client componentlere import ETMEYİN.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin client için URL veya SERVICE_ROLE_KEY eksik")
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

