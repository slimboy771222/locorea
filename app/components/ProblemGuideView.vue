<script setup lang="ts">
import { ExternalLink, Youtube } from 'lucide-vue-next'
import type { ProblemGuide, ProblemGuideResource, ProblemGuideSection } from '~/types/problem-guide'

const props = defineProps<{ guide: ProblemGuide }>()

const sectionEyebrow = (sectionType: string) => ({
  intro: 'Start here',
  do_first: 'Do this first',
  what_you_need: 'Prepare',
  good_to_know: 'Good to know',
  related_guide: 'Related guide',
  fallback: 'Still need help?',
}[sectionType] ?? 'Guide')

const sectionClass = (sectionType: string) => ({
  intro: 'rounded-xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6',
  do_first: 'rounded-xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6',
  good_to_know: 'border-l-4 border-slate-300 bg-slate-50/70 py-1 pl-5 pr-4',
  related_guide: 'rounded-xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6',
  fallback: 'rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6',
}[sectionType] ?? '')

const stepNumber = (section: ProblemGuideSection) => props.guide.sections
  .filter(candidate => candidate.sectionType === 'step')
  .findIndex(candidate => candidate.id === section.id) + 1

const actionsForSection = (section: ProblemGuideSection) => props.guide.actions
  .filter(action => action.sectionId === section.id)

const remainingActions = computed(() => props.guide.actions.filter(action => action.sectionId === null))

const isSafeExternalUrl = (href: string | null) => Boolean(href && /^https?:\/\//i.test(href))
const isYouTube = (resource: ProblemGuideResource) => resource.platform?.toLowerCase() === 'youtube'
const officialResources = computed(() => props.guide.resources.filter(resource => resource.resourceType === 'official' && !isYouTube(resource)))
const officialVideos = computed(() => props.guide.resources.filter(resource => resource.resourceType === 'official' && isYouTube(resource)))
const externalResources = computed(() => props.guide.resources.filter(resource => resource.resourceType === 'external'))
const resourceMeta = (resource: ProblemGuideResource) => [resource.platform, resource.creatorName, resource.language].filter(Boolean).join(' · ')
const resourceActionLabel = (resource: ProblemGuideResource) => {
  if (isYouTube(resource)) return 'Watch video'
  if (resource.platform?.toLowerCase() === 'blog') return 'Read guide'
  if (resource.platform?.toLowerCase() === 'instagram') return 'Open profile'
  return 'Open resource'
}
const formatReviewedDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value))
  : null
</script>

<template>
  <article class="mx-auto max-w-[800px]">
    <header>
      <p class="text-sm font-semibold text-blue-700">Problem guide</p>
      <h2 class="mt-2 text-[28px] font-bold tracking-tight text-slate-950 sm:text-3xl">{{ guide.title }}</h2>
      <p v-if="guide.summary" class="mt-3 max-w-3xl text-[16px] leading-7 text-slate-600">{{ guide.summary }}</p>
    </header>

    <div class="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
      <section v-for="section in guide.sections" :key="section.id" :class="sectionClass(section.sectionType)">
        <div v-if="section.sectionType === 'step'" class="flex gap-4 sm:gap-5">
          <span class="grid size-8 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-50 text-sm font-bold text-blue-800">{{ stepNumber(section) }}</span>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Step {{ stepNumber(section) }}</p>
            <h3 v-if="section.title" class="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{{ section.title }}</h3>
            <GuideBody :content="section.bodyMarkdown" />
            <ProblemGuideActions v-if="actionsForSection(section).length" :actions="actionsForSection(section)" />
          </div>
        </div>
        <template v-else>
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">{{ sectionEyebrow(section.sectionType) }}</p>
          <h3 v-if="section.title" class="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{{ section.title }}</h3>
          <GuideBody :content="section.bodyMarkdown" />
          <ProblemGuideActions v-if="actionsForSection(section).length" :actions="actionsForSection(section)" />
        </template>
      </section>
    </div>

    <section v-if="remainingActions.length" class="mt-10 border-t border-slate-200 pt-8">
      <p class="text-sm font-semibold text-blue-700">Quick actions</p>
      <h3 class="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Useful next steps</h3>
      <ProblemGuideActions :actions="remainingActions" />
    </section>

    <section v-if="guide.phrases.length" class="mt-10 border-t border-slate-200 pt-8">
      <p class="text-sm font-semibold text-blue-700">Useful Korean</p>
      <h3 class="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Show this when you need help</h3>
      <div class="mt-4 grid gap-x-7 sm:grid-cols-2">
        <ProblemPhraseCard v-for="phrase in guide.phrases" :key="phrase.id" :phrase="phrase" />
      </div>
    </section>

    <section v-if="officialResources.length" class="mt-10 border-t border-slate-200 pt-8">
      <p class="text-sm font-semibold text-blue-700">Official resources</p>
      <h3 class="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Check current requirements</h3>
      <div class="mt-4 divide-y divide-slate-200">
        <article v-for="resource in officialResources" :key="resource.id" class="py-5 first:pt-0 last:pb-0">
          <p v-if="resource.organization" class="text-xs font-semibold uppercase tracking-[0.1em] text-blue-700">{{ resource.organization }}</p>
          <h4 class="mt-1.5 text-base font-bold text-slate-950">{{ resource.title }}</h4>
          <p v-if="resource.description" class="mt-1.5 text-sm leading-6 text-slate-600">{{ resource.description }}</p>
          <a v-if="isSafeExternalUrl(resource.url)" :href="resource.url" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">{{ resourceActionLabel(resource) }} <ExternalLink :size="16" aria-hidden="true" /></a>
        </article>
      </div>
    </section>

    <section v-if="officialVideos.length" class="mt-10 border-t border-slate-200 pt-8">
      <p class="text-sm font-semibold text-blue-700">Official videos</p>
      <h3 class="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Watch from trusted sources</h3>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <article v-for="resource in officialVideos" :key="resource.id" class="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <div class="flex items-start gap-3"><span class="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-blue-700"><Youtube :size="19" aria-hidden="true" /></span><div class="min-w-0"><p v-if="resource.organization" class="text-xs font-semibold uppercase tracking-[0.1em] text-blue-700">{{ resource.organization }}</p><h4 class="mt-1 text-base font-bold text-slate-950">{{ resource.title }}</h4><p v-if="resourceMeta(resource)" class="mt-1 text-xs text-slate-500">{{ resourceMeta(resource) }}</p></div></div>
          <p v-if="resource.description" class="mt-3 text-sm leading-6 text-slate-600">{{ resource.description }}</p>
          <a v-if="isSafeExternalUrl(resource.url)" :href="resource.url" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Watch video <Youtube :size="16" aria-hidden="true" /></a>
        </article>
      </div>
    </section>

    <section v-if="externalResources.length" class="mt-10 border-t border-slate-200 pt-8">
      <p class="text-sm font-semibold text-blue-700">Helpful guides from the web</p>
      <p class="mt-2 text-sm leading-6 text-slate-600">External content is provided by third parties. Check official resources for current requirements.</p>
      <div class="mt-4 divide-y divide-slate-200">
        <article v-for="resource in externalResources" :key="resource.id" class="border-l-2 border-slate-200 py-5 pl-4 first:pt-0 last:pb-0">
          <p v-if="resourceMeta(resource)" class="text-xs font-medium text-slate-500">{{ resourceMeta(resource) }}</p>
          <h4 class="mt-1.5 text-base font-bold text-slate-950">{{ resource.title }}</h4>
          <p v-if="resource.description" class="mt-1.5 text-sm leading-6 text-slate-600">{{ resource.description }}</p>
          <a v-if="isSafeExternalUrl(resource.url)" :href="resource.url" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">{{ resourceActionLabel(resource) }} <ExternalLink :size="16" aria-hidden="true" /></a>
        </article>
      </div>
    </section>

    <p v-if="formatReviewedDate(guide.lastReviewedAt)" class="mt-10 border-t border-slate-200 pt-5 text-xs text-slate-500">Information reviewed: {{ formatReviewedDate(guide.lastReviewedAt) }}</p>
  </article>
</template>
