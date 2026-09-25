export const useMedia = () => {
  const supabase = useSupabase()

  const getPublicMediaUrl = (
    storagePath?: string | null,
  ) => {
    if (!storagePath) {
      return null
    }

    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath)

    return data.publicUrl
  }

  return {
    getPublicMediaUrl,
  }
}