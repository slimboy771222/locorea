import type { ProblemGuide, ProblemGuideAction, ProblemGuidePhrase, ProblemGuideResource, ProblemGuideSection } from '~/types/problem-guide'

const bySortOrder = <T extends { sort_order: number }>(left: T, right: T) => left.sort_order - right.sort_order

export const useProblemGuides = () => {
  const supabase = useSupabase()

  const getProblemGuideBySlug = async (slug: string): Promise<ProblemGuide | null> => {
    const { data: guide, error: guideError } = await supabase
      .from('problem_guides')
      .select('id, slug, category, guide_type, title, summary, last_reviewed_at')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (guideError) throw guideError
    if (!guide) return null

    const [sectionsResult, actionsResult, phrasesResult, resourcesResult] = await Promise.all([
      supabase.from('problem_guide_sections').select('id, section_type, title, body_markdown, sort_order').eq('guide_id', guide.id).order('sort_order'),
      supabase.from('problem_guide_actions').select('id, section_id, action_key, action_type, label, description, href, variant, sort_order').eq('guide_id', guide.id).order('sort_order'),
      supabase.from('problem_guide_phrases').select('id, context, text_en, text_ko, romanization, sort_order').eq('guide_id', guide.id).order('sort_order'),
      supabase.from('problem_guide_resources').select('id, resource_type, platform, title, description, organization, creator_name, url, language, sort_order').eq('guide_id', guide.id).order('sort_order'),
    ])

    const childError = sectionsResult.error ?? actionsResult.error ?? phrasesResult.error ?? resourcesResult.error
    if (childError) throw childError

    const sections: ProblemGuideSection[] = (sectionsResult.data ?? []).sort(bySortOrder).map(section => ({
      id: section.id,
      sectionType: section.section_type,
      title: section.title,
      bodyMarkdown: section.body_markdown,
      sortOrder: section.sort_order,
    }))
    const actions: ProblemGuideAction[] = (actionsResult.data ?? []).sort(bySortOrder).map(action => ({
      id: action.id,
      sectionId: action.section_id,
      actionKey: action.action_key,
      actionType: action.action_type as ProblemGuideAction['actionType'],
      label: action.label,
      description: action.description,
      href: action.href,
      variant: action.variant as ProblemGuideAction['variant'],
      sortOrder: action.sort_order,
    }))
    const phrases: ProblemGuidePhrase[] = (phrasesResult.data ?? []).sort(bySortOrder).map(phrase => ({
      id: phrase.id,
      context: phrase.context,
      textEn: phrase.text_en,
      textKo: phrase.text_ko,
      romanization: phrase.romanization,
      sortOrder: phrase.sort_order,
    }))
    const resources: ProblemGuideResource[] = (resourcesResult.data ?? []).sort(bySortOrder).map(resource => ({
      id: resource.id,
      resourceType: resource.resource_type as ProblemGuideResource['resourceType'],
      platform: resource.platform,
      title: resource.title,
      description: resource.description,
      organization: resource.organization,
      creatorName: resource.creator_name,
      url: resource.url,
      language: resource.language,
      sortOrder: resource.sort_order,
    }))

    return {
      id: guide.id,
      slug: guide.slug,
      category: guide.category,
      guideType: guide.guide_type as ProblemGuide['guideType'],
      title: guide.title,
      summary: guide.summary,
      lastReviewedAt: guide.last_reviewed_at,
      sections,
      actions,
      phrases,
      resources,
      officialResources: resources.filter(resource => resource.resourceType === 'official'),
      externalResources: resources.filter(resource => resource.resourceType === 'external'),
    }
  }

  return { getProblemGuideBySlug }
}
