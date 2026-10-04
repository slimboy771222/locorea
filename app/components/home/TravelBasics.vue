<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { discovery } from '~/config/discovery'

const cardImage = '/images/hero/locorea-seoul-hero.png'
</script>

<template>
  <section id="travel-basics" class="border-b border-slate-100 bg-[var(--lc-surface-practical)]">
    <div class="mx-auto max-w-7xl px-5 py-9 sm:py-10 lg:px-8 lg:py-12">
      <div class="flex items-end justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-blue-700">Good to know before you go</p>
          <h2 class="mt-1.5 text-[26px] font-bold tracking-tight text-slate-950 md:text-[28px]">Korea Travel Basics</h2>
        </div>
        <NuxtLink
          to="/search?type=guides"
          aria-label="Browse all guides"
          class="inline-flex size-11 shrink-0 items-center justify-center rounded-full transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span class="inline-flex size-9 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200 shadow-sm">
            <ArrowRight :size="18" aria-hidden="true" />
          </span>
        </NuxtLink>
      </div>

      <div class="mt-4 flex max-w-full snap-x snap-proximity gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-5 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
        <NuxtLink
          v-for="item in discovery.travelBasics"
          :key="item.guideType"
          :to="item.to"
          :aria-label="`${item.title}: ${item.description}`"
          class="group w-[148px] shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-auto"
        >
          <div class="relative aspect-[4/3] overflow-hidden bg-slate-200">
            <img
              :src="cardImage"
              alt=""
              class="h-full w-full object-cover brightness-90 saturate-75 transition duration-300 group-hover:scale-[1.03]"
              :style="{ objectPosition: item.imagePosition }"
            >
            <div class="absolute inset-0 bg-slate-950/15" />
            <div class="absolute bottom-2 left-2 flex size-8 items-center justify-center rounded-lg bg-white/95 text-blue-700 shadow-sm">
              <component :is="item.icon" :size="17" aria-hidden="true" />
            </div>
          </div>
          <div class="min-w-0 p-3">
            <h3 class="line-clamp-2 text-[16px] font-semibold leading-5 text-slate-900">{{ item.title }}</h3>
            <p class="mt-1 truncate text-[13px] leading-4 text-slate-500">{{ item.description }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
