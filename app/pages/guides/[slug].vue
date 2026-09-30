<script setup lang="ts">
import { ArrowUpRight, ExternalLink, ShieldCheck } from 'lucide-vue-next'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const { getGuideBySlug } = useGuides()
const { getPublicMediaUrl } = useMedia()

const { data: guide, error } = await useAsyncData(`guide-${slug.value}`, () => getGuideBySlug(slug.value))

if (error.value) {
  throw createError({ statusCode: 500, statusMessage: 'Failed to load guide', cause: error.value })
}

if (!guide.value) {
  throw createError({ statusCode: 404, statusMessage: 'Guide not found' })
}

const content = computed(() =>
  guide.value?.guide_translations?.find(item => item.language_code === 'en')
  ?? guide.value?.guide_translations?.[0],
)

const guideTypeLabel = computed(() => guide.value?.guide_type.replaceAll('_', ' ') ?? 'Guide')
const coverUrl = computed(() => getPublicMediaUrl(guide.value?.cover?.storage_path))
const coverAlt = computed(() => guide.value?.cover?.alt_text ?? content.value?.title ?? 'Guide cover image')
const sourceUrl = computed(() => guide.value?.source_url ?? guide.value?.sources?.url)

const formatVerifiedDate = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(new Date(value))

const getGuideTranslation = (item: { guide_translations: Array<{ language_code: string, title: string, summary: string | null }> }) =>
  item.guide_translations.find(translation => translation.language_code === 'en')
  ?? item.guide_translations[0]

useSeoMeta({
  title: () => content.value ? `${content.value.title} — Locorea` : 'Guide — Locorea',
  description: () => content.value?.summary ?? '',
})
</script>

<template>
  <main v-if="guide" class="mx-auto max-w-7xl px-5 py-8 sm:py-10 lg:px-8 lg:py-12">
    <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
      <NuxtLink to="/search?type=guides" class="transition hover:text-blue-700">Guides</NuxtLink>
      <span aria-hidden="true">/</span>
      <span>{{ guideTypeLabel }}</span>
    </nav>

    <header class="mt-5 max-w-3xl">
      <div class="flex items-start justify-between gap-4">
        <p class="text-sm font-semibold uppercase tracking-[0.08em] text-blue-700">{{ guideTypeLabel }}</p>
        <ContentActions content-type="guide" :title="content?.title ?? 'Guide'" :text="content?.summary" />
      </div>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{{ content?.title }}</h1>
      <p v-if="content?.summary" class="mt-4 max-w-2xl text-[17px] leading-7 text-slate-600 sm:text-lg">{{ content.summary }}</p>
      <p v-if="guide.last_verified_at || guide.sources" class="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
        <span v-if="guide.last_verified_at">Last verified {{ formatVerifiedDate(guide.last_verified_at) }}</span>
        <span v-if="guide.last_verified_at && guide.sources" aria-hidden="true">·</span>
        <span v-if="guide.sources">Source: {{ guide.sources.name }}</span>
      </p>
    </header>

    <figure v-if="coverUrl" class="relative mt-7 overflow-hidden rounded-2xl bg-slate-100 sm:mt-8 sm:aspect-[16/7]">
      <img :src="coverUrl" :alt="coverAlt" class="aspect-[4/3] w-full object-cover sm:h-full sm:aspect-auto">
      <figcaption v-if="guide.cover?.credit_text" class="absolute bottom-3 right-3 rounded-md bg-slate-950/55 px-2 py-1 text-xs text-white/90">{{ guide.cover.credit_text }}</figcaption>
    </figure>

    <div class="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,740px)_260px] lg:justify-between lg:gap-14">
      <div class="min-w-0">
        <article v-if="content?.body_markdown" aria-label="Guide content">
          <GuideBody :content="content.body_markdown" />
        </article>

        <section v-if="guide.relatedGuides.length" class="mt-10" aria-labelledby="related-guides-heading">
          <PublicSectionHeading eyebrow="Keep planning" title="Related practical guides" heading-id="related-guides-heading" />
          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <NuxtLink v-for="item in guide.relatedGuides" :key="item.id" :to="`/guides/${item.slug}`" class="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              <p class="text-xs font-semibold uppercase tracking-[0.07em] text-slate-400">{{ item.guide_type.replaceAll('_', ' ') }}</p>
              <h3 class="mt-1.5 text-[17px] font-semibold text-slate-950 transition group-hover:text-blue-700">{{ getGuideTranslation(item)?.title }}</h3>
              <p v-if="getGuideTranslation(item)?.summary" class="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-600">{{ getGuideTranslation(item)?.summary }}</p>
              <span class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">Read guide <ArrowUpRight :size="15" aria-hidden="true" /></span>
            </NuxtLink>
          </div>
        </section>
      </div>

      <aside class="lg:pt-1">
        <div v-if="guide.sources || guide.last_verified_at" class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 lg:sticky lg:top-24">
          <div class="flex items-center gap-2 text-slate-400"><ShieldCheck :size="16" aria-hidden="true" /><p class="text-[11px] font-semibold uppercase tracking-[0.08em]">Trust & source</p></div>
          <dl class="mt-3 space-y-3 text-sm">
            <div v-if="guide.sources"><dt class="text-slate-500">Source</dt><dd class="mt-1 font-medium text-slate-800">{{ guide.sources.name }}</dd></div>
            <div v-if="guide.last_verified_at"><dt class="text-slate-500">Last verified</dt><dd class="mt-1 font-medium text-slate-800">{{ formatVerifiedDate(guide.last_verified_at) }}</dd></div>
          </dl>
          <a v-if="sourceUrl" :href="sourceUrl" target="_blank" rel="noreferrer" class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:text-blue-800">View source <ExternalLink :size="15" aria-hidden="true" /></a>
        </div>
      </aside>
    </div>
  </main>
</template>
