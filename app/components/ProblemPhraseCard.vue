<script setup lang="ts">
import { Expand, X } from 'lucide-vue-next'
import type { ProblemGuidePhrase } from '~/types/problem-guide'

defineProps<{ phrase: ProblemGuidePhrase }>()

const isFullscreen = ref(false)
</script>

<template>
  <article class="border-b border-slate-200 py-4 first:pt-0 last:border-b-0 last:pb-0">
    <p v-if="phrase.context" class="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">{{ phrase.context }}</p>
    <p class="mt-2 text-[16px] font-semibold leading-6 text-slate-950">{{ phrase.textEn }}</p>
    <p class="mt-2 text-lg font-bold leading-7 text-slate-950 sm:text-xl">{{ phrase.textKo }}</p>
    <p v-if="phrase.romanization" class="mt-1 text-sm italic text-slate-500">{{ phrase.romanization }}</p>
    <button type="button" class="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="isFullscreen = true">
      <Expand :size="17" aria-hidden="true" />Show full screen
    </button>
  </article>

  <Teleport to="body">
    <div v-if="isFullscreen" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/95 p-5" role="dialog" aria-modal="true" :aria-label="`Korean phrase: ${phrase.textEn}`">
      <button type="button" class="absolute right-4 top-4 inline-flex size-12 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label="Close full-screen Korean phrase" @click="isFullscreen = false"><X :size="24" aria-hidden="true" /></button>
      <div class="max-w-5xl text-center text-white">
        <p class="text-sm font-medium text-white/70 sm:text-base">{{ phrase.textEn }}</p>
        <p class="mt-6 break-keep text-5xl font-bold leading-tight tracking-tight sm:text-7xl lg:text-8xl">{{ phrase.textKo }}</p>
        <p v-if="phrase.romanization" class="mt-6 text-base italic text-white/70 sm:text-lg">{{ phrase.romanization }}</p>
      </div>
    </div>
  </Teleport>
</template>
