import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

export const useSupabase = () => {
  const config = useRuntimeConfig()

  return createClient<Database>(
    config.public.supabaseUrl,
    config.public.supabasePublishableKey,
  )
}