<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
import type { GuideSearchResult } from '~/composables/useSearch'

const props = defineProps<{ item: GuideSearchResult }>()
const { getPublicMediaUrl } = useMedia()
const label = (value: string) => value.replaceAll('_', ' ')
const verified = computed(() => props.item.lastVerifiedAt ? new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(props.item.lastVerifiedAt)) : null)
</script>

<template>
  <NuxtLink :to="`/guides/${props.item.slug}`" class="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
    <div class="relative aspect-[16/8] overflow-hidden bg-gradient-to-br from-amber-50 via-slate-50 to-blue-50">
      <img v-if="props.item.cover" :src="getPublicMediaUrl(props.item.cover.storage_path) ?? undefined" :alt="props.item.cover.alt_text ?? props.item.title" class="h-full w-full object-cover">
      <span class="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600 shadow-sm"><BookOpen :size="13" /> {{ label(props.item.guideType) }}</span>
    </div>
    <div class="p-4"><h3 class="font-semibold text-slate-900">{{ props.item.title }}</h3><p v-if="verified" class="mt-1 text-xs text-slate-400">Verified {{ verified }}</p><p class="mt-2 line-clamp-2 text-[15px] leading-5 text-slate-500">{{ props.item.summary }}</p></div>
  </NuxtLink>
</template>
