export type ProblemGuideSection = {
  id: string
  sectionType: string
  title: string | null
  bodyMarkdown: string
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
