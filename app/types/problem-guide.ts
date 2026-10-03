export type ProblemGuideChoiceOption = {
  key: string
  label: string
  title: string
  bodyMarkdown: string
  actionKeys?: string[]
}

export type ProblemGuideChoiceData = {
  prompt: string
  options: ProblemGuideChoiceOption[]
}

export type ProblemGuideInteractionData = ProblemGuideChoiceData

type ProblemGuideChoiceOptionPayload = {
  key?: unknown
  label?: unknown
  title?: unknown
  body_markdown?: unknown
  action_keys?: unknown
}

type ProblemGuideChoicePayload = {
  prompt?: unknown
  options?: unknown
}

export const normalizeProblemGuideChoiceData = (value: unknown): ProblemGuideChoiceData | null => {
  if (!value || typeof value !== 'object') return null

  const candidate = value as ProblemGuideChoicePayload
  if (typeof candidate.prompt !== 'string' || !Array.isArray(candidate.options)) return null

  const options = candidate.options.map((option): ProblemGuideChoiceOption | null => {
    if (!option || typeof option !== 'object') return null

    const item = option as ProblemGuideChoiceOptionPayload
    if (
      typeof item.key !== 'string'
      || typeof item.label !== 'string'
      || typeof item.title !== 'string'
      || typeof item.body_markdown !== 'string'
      || (item.action_keys !== undefined && (!Array.isArray(item.action_keys) || item.action_keys.some(key => typeof key !== 'string')))
    ) return null

    return {
      key: item.key,
      label: item.label,
      title: item.title,
      bodyMarkdown: item.body_markdown,
      actionKeys: item.action_keys as string[] | undefined,
    }
  })

  return options.every((option): option is ProblemGuideChoiceOption => option !== null)
    ? { prompt: candidate.prompt, options }
    : null
}

export const isProblemGuideChoiceData = (value: unknown): value is ProblemGuideChoiceData => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as { prompt?: unknown; options?: unknown }
  return typeof candidate.prompt === 'string'
    && Array.isArray(candidate.options)
    && candidate.options.every(option => {
      if (!option || typeof option !== 'object') return false
      const item = option as Record<string, unknown>
      return typeof item.key === 'string'
        && typeof item.label === 'string'
        && typeof item.title === 'string'
        && typeof item.bodyMarkdown === 'string'
        && (item.actionKeys === undefined || (Array.isArray(item.actionKeys) && item.actionKeys.every(key => typeof key === 'string')))
    })
}

export type ProblemGuideSection = {
  id: string
  sectionType: string
  title: string | null
  bodyMarkdown: string
  interactionData: ProblemGuideInteractionData | null
  sortOrder: number
}

export type ProblemGuideAction = {
  id: string
  sectionId: string | null
  actionKey: string | null
  actionType: 'internal' | 'external' | 'phone'
  label: string
  description: string | null
  href: string | null
  variant: 'default' | 'primary' | 'danger'
  sortOrder: number
}

export type ProblemGuidePhrase = {
  id: string
  context: string | null
  textEn: string
  textKo: string
  romanization: string | null
  sortOrder: number
}

export type ProblemGuideResource = {
  id: string
  resourceType: 'official' | 'external'
  /**
   * Convention: official website/youtube/pdf use resourceType "official";
   * third-party youtube/blog/instagram use resourceType "external".
   */
  platform: string | null
  title: string
  description: string | null
  organization: string | null
  creatorName: string | null
  url: string
  language: string | null
  sortOrder: number
}

export type ProblemGuide = {
  id: string
  slug: string
  category: string
  guideType: 'problem' | 'practical'
  title: string
  summary: string | null
  lastReviewedAt: string | null
  sections: ProblemGuideSection[]
  actions: ProblemGuideAction[]
  phrases: ProblemGuidePhrase[]
  resources: ProblemGuideResource[]
  officialResources: ProblemGuideResource[]
  externalResources: ProblemGuideResource[]
}
