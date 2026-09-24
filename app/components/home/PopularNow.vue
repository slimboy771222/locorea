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
}

defineProps<{
  items: Item[]
  pending: boolean
  failed: boolean
}>()

const getTranslation = (translations: Translation[]) => {
  return translations.find(item => item.language_code === 'en') ?? translations[0]
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-9 lg:px-8">
    <div class="mb-5 flex items-end justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-blue-600">Start exploring</p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Popular Right Now</h2>
        <p class="mt-1 text-sm text-slate-500">Useful places and travel information for your Korea trip.</p>
      </div>
      <NuxtLink to="/search" class="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700">View all <span aria-hidden="true">→</span></NuxtLink>
    </div>

    <div v-if="pending" class="flex gap-3 overflow-hidden" aria-label="Loading popular content">
      <div v-for="index in 5" :key="index" class="h-72 min-w-56 animate-pulse rounded-2xl bg-slate-100 sm:min-w-60" />
    </div>
    <p v-else-if="failed" class="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Popular travel data is unavailable right now.</p>
    <p v-else-if="!items.length" class="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">New Korea travel picks will appear here soon.</p>
    <div v-else class="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
      <NuxtLink v-for="item in items" :key="`${item.kind}-${item.id}`" :to="`/${item.kind === 'place' ? 'places' : 'guides'}/${item.slug}`" class="group min-w-64 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg sm:min-w-0">
        <div class="aspect-[4/3] bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100 p-3">
          <span class="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600 shadow-sm">{{ item.type }}</span>
        </div>
        <div class="p-4">
          <p class="text-xs font-medium text-slate-400">{{ item.kind === 'place' ? 'Place' : 'Practical guide' }}</p>
          <h3 class="mt-1 line-clamp-2 font-semibold text-slate-900">{{ getTranslation(item.translations)?.name ?? getTranslation(item.translations)?.title ?? 'Explore Korea' }}</h3>
          <p class="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">{{ getTranslation(item.translations)?.summary ?? 'Practical information for your Korea trip.' }}</p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
