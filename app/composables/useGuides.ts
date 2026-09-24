export const useGuides = () => {
  const supabase = useSupabase()

  const getGuideBySlug = async (slug: string) => {
    const { data, error } = await supabase
      .from('guides')
      .select(`
        id,
        slug,
        guide_type,
        featured,
        last_verified_at,

        guide_translations (
          language_code,
          title,
          summary,
          body_markdown
        ),

        sources (
          name,
          url,
          attribution
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  return {
    getGuideBySlug,
  }
}