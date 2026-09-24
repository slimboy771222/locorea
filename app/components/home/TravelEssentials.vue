<script setup lang="ts">
import { ArrowUpRight, BookOpenCheck } from 'lucide-vue-next'

type Translation = { language_code: string; title: string; summary: string | null }
type Guide = { id: string; slug: string; guide_type: string; guide_translations: Translation[] }

defineProps<{ guides: Guide[]; pending: boolean; failed: boolean }>()

const getTranslation = (translations: Translation[]) => translations.find(item => item.language_code === 'en') ?? translations[0]
</script>

<template>
  <section class="bg-slate-50/90">
    <div class="mx-auto max-w-7xl px-5 py-9 lg:px-8">
      <div class="mb-5">
        <p class="text-sm font-medium text-blue-600">Plan your trip</p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Korea Travel Essentials</h2>
        <p class="mt-1 text-sm text-slate-500">Practical guides for a smoother arrival and stay.</p>
      </div>
      <div v-if="pending" class="grid grid-cols-2 gap-3 lg:grid-cols-5"><div v-for="index in 5" :key="index" class="h-36 animate-pulse rounded-2xl bg-white" /></div>
      <p v-else-if="failed" class="rounded-xl bg-white p-4 text-sm text-slate-600">Travel essentials are unavailable right now.</p>
      <p v-else-if="!guides.length" class="rounded-xl bg-white p-4 text-sm text-slate-600">Practical Korea guides are coming soon.</p>
      <div v-else class="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <NuxtLink v-for="guide in guides" :key="guide.id" :to="`/guides/${guide.slug}`" class="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-md">
          <BookOpenCheck :size="20" class="text-blue-600" />
          <p class="mt-4 text-xs font-medium capitalize text-slate-400">{{ guide.guide_type }}</p>
          <h3 class="mt-1 line-clamp-2 font-semibold leading-5 text-slate-900">{{ getTranslation(guide.guide_translations)?.title ?? 'Korea travel guide' }}</h3>
          <ArrowUpRight :size="17" class="mt-3 text-slate-400 transition group-hover:text-blue-600" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
