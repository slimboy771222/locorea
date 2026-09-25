import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

let browserClient: SupabaseClient<Database> | null = null

export const useSupabase = () => {
  const config = useRuntimeConfig()

  if (import.meta.client && browserClient) {
    return browserClient
  }

  const client = createClient<Database>(
    config.public.supabaseUrl,
    config.public.supabasePublishableKey,
  )

  if (import.meta.client) {
    browserClient = client
  }

  return client
}
