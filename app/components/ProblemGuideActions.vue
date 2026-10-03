<script setup lang="ts">
import { ArrowRight, BookOpen, ExternalLink, Landmark, Phone } from 'lucide-vue-next'
import type { ProblemGuideAction } from '~/types/problem-guide'

defineProps<{ actions: ProblemGuideAction[] }>()

const actionClass = (action: ProblemGuideAction) => ({
  primary: 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800 focus-visible:outline-blue-700',
  danger: 'border-red-700 bg-red-700 text-white hover:bg-red-800 focus-visible:outline-red-700',
  default: 'border-slate-300 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-blue-700',
}[action.variant])

const isSafeExternalUrl = (href: string | null) => Boolean(href && /^https?:\/\//i.test(href))
const isSafePhoneUrl = (href: string | null) => Boolean(href && /^tel:[0-9+()\-\s]+$/i.test(href))
const isSafeInternalUrl = (href: string | null) => Boolean(href && /^\/(?!\/)/.test(href))
const isExternalAction = (action: ProblemGuideAction) => action.actionType === 'external' && isSafeExternalUrl(action.href)
const isPhoneAction = (action: ProblemGuideAction) => action.actionType === 'phone' && isSafePhoneUrl(action.href)
const internalActionIsAvailable = (action: ProblemGuideAction) => action.actionType === 'internal' && isSafeInternalUrl(action.href)
const isRelatedGuide = (action: ProblemGuideAction) => action.actionKey === 'related_guide'
</script>

<template>
  <div class="mt-5 space-y-2">
    <template v-for="action in actions" :key="action.id">
      <NuxtLink v-if="isRelatedGuide(action) && internalActionIsAvailable(action)" :to="action.href!" class="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-blue-200 bg-white px-3.5 py-3 text-left text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
        <span><span class="block text-sm font-bold text-blue-900">{{ action.label }}</span><span v-if="action.description" class="mt-1 block text-xs leading-5 text-slate-600">{{ action.description }}</span></span><BookOpen :size="18" class="shrink-0 text-blue-700" aria-hidden="true" />
      </NuxtLink>
      <a v-else-if="isExternalAction(action) && action.href" :href="action.href" target="_blank" rel="noopener noreferrer" :class="actionClass(action)" class="flex min-h-12 items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2">
        <span><span class="font-bold">{{ action.label }}</span><span v-if="action.description" class="ml-1.5 text-xs opacity-80">{{ action.description }}</span></span><ExternalLink :size="16" class="shrink-0" aria-hidden="true" />
      </a>
      <a v-else-if="isPhoneAction(action) && action.href" :href="action.href" :class="actionClass(action)" class="flex min-h-12 items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2">
        <span><span class="font-bold">{{ action.label }}</span><span v-if="action.description" class="ml-1.5 text-xs opacity-80">{{ action.description }}</span></span><Phone :size="16" class="shrink-0" aria-hidden="true" />
      </a>
      <NuxtLink v-else-if="internalActionIsAvailable(action)" :to="action.href!" :class="actionClass(action)" class="flex min-h-12 items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2">
        <span><span class="font-bold">{{ action.label }}</span><span v-if="action.description" class="ml-1.5 text-xs opacity-80">{{ action.description }}</span></span><ArrowRight :size="16" class="shrink-0" aria-hidden="true" />
      </NuxtLink>
      <div v-else class="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left text-sm text-slate-500" aria-disabled="true">
        <span><span class="font-bold text-slate-700">{{ action.label }}</span><span v-if="action.description" class="ml-1.5 text-xs">{{ action.description }}</span><span class="ml-1.5 text-xs font-medium">Coming soon</span></span><Landmark :size="16" class="shrink-0" aria-hidden="true" />
      </div>
    </template>
  </div>
</template>
