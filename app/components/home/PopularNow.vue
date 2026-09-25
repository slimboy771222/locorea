<script setup lang="ts">
type Translation = {
  language_code: string
  name?: string
  title?: string
  summary: string | null
}

type Item = {
  id: string
  slug: string
  kind: 'place' | 'guide'
  type: string
  translations: Translation[]
  cover?: {
    storage_path: string
    alt_text: string | null
    credit_text: string | null
  } | null
}

defineProps<{
  items: Item[]
  pending: boolean
  failed: boolean
}>()

const getTranslation = (translations: Translation[]) => {
  return translations.find(item => item.language_code === 'en') ?? translations[0]
}

const { getPublicMediaUrl } = useMedia()

const getItemTitle = (item: Item) => {
  const translation = getTranslation(item.translations)

  return translation?.name ?? translation?.title ?? 'Explore Korea'
}

const getCoverAlt = (item: Item) => {
  return item.cover?.alt_text ?? getItemTitle(item)
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-10 lg:px-8">
    <div class="mb-5 flex items-end justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-blue-600">Start exploring</p>
        <h2 class="mt-1 text-[22px] font-bold tracking-tight text-slate-950 md:text-[26px]">Popular Right Now</h2>
        <p class="mt-1 text-[15px] leading-6 text-slate-500">Useful places and travel information for your Korea trip.</p>
      </div>
      <NuxtLink to="/search" class="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700">View all <span aria-hidden="true">→</span></NuxtLink>
    </div>

    <div v-if="pending" class="flex gap-3 overflow-hidden" aria-label="Loading popular content">
      <div v-for="index in 5" :key="index" class="h-72 min-w-56 animate-pulse rounded-2xl bg-slate-100 sm:min-w-60" />
    </div>
    <p v-else-if="failed" class="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Popular travel data is unavailable right now.</p>
    <p v-else-if="!items.length" class="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">New Korea travel picks will appear here soon.</p>
    <div v-else class="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-4">
      <NuxtLink v-for="item in items" :key="`${item.kind}-${item.id}`" :to="`/${item.kind === 'place' ? 'places' : 'guides'}/${item.slug}`" class="group min-w-[78vw] snap-start overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg sm:min-w-0">
        <div class="relative aspect-[8/5] overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-3">
          <img
            v-if="item.cover"
            :src="getPublicMediaUrl(item.cover.storage_path) ?? undefined"
            :alt="getCoverAlt(item)"
            class="absolute inset-0 h-full w-full object-cover"
          >
          <span class="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600 shadow-sm">{{ item.type }}</span>
        </div>
        <div class="p-4">
          <p class="text-xs font-medium text-slate-400">{{ item.kind === 'place' ? 'Place' : 'Practical guide' }}</p>
          <h3 class="mt-1 line-clamp-2 font-semibold text-slate-900">{{ getItemTitle(item) }}</h3>
          <p class="mt-2 line-clamp-2 text-[15px] leading-5 text-slate-500">{{ getTranslation(item.translations)?.summary ?? 'Practical information for your Korea trip.' }}</p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
