import type { User } from '@supabase/supabase-js'

type SignInResult =
  | { success: true }
  | { success: false; reason: 'invalid-credentials' | 'not-authorized' }

export const useAdminAuth = () => {
  const supabase = useSupabase()
  const currentUser = useState<User | null>('admin-current-user', () => null)

  const getCurrentUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        currentUser.value = null
        return null
      }

      currentUser.value = data.user
      return data.user
    }
    catch {
      currentUser.value = null
      return null
    }
  }

  const checkAdmin = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin')

      if (error) {
        return false
      }

      return data
    }
    catch {
      return false
    }
  }

  const signIn = async (
    email: string,
    password: string,
  ): Promise<SignInResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      return { success: false, reason: 'invalid-credentials' }
    }

    currentUser.value = data.user

    if (!await checkAdmin()) {
      return { success: false, reason: 'not-authorized' }
    }

    return { success: true }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    currentUser.value = null
  }

  return {
    signIn,
    signOut,
    getCurrentUser,
    checkAdmin,
  }
}
