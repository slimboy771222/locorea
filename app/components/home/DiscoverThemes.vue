<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { discovery } from '~/config/discovery'
</script>

<template>
  <section id="discover-themes" class="bg-slate-50/90">
    <div class="mx-auto max-w-7xl px-5 py-9 sm:py-10 lg:px-8 lg:py-14">
      <div class="mb-6 max-w-xl md:mb-7">
        <p class="text-sm font-semibold text-[var(--lc-coral)]">Explore by mood</p>
        <h2 class="mt-1.5 text-[24px] font-bold tracking-tight text-slate-950 md:text-[28px]">
          Discover Korea by Theme
        </h2>
        <p class="mt-2 text-[15px] leading-6 text-slate-600">
          Find places and ideas that match the way you want to travel.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <NuxtLink
          v-for="theme in discovery.themes"
          :key="theme.key"
          :to="theme.to"
          class="group relative isolate flex aspect-[5/4] overflow-hidden rounded-2xl p-4 text-left outline-none transition duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 md:aspect-auto md:min-h-48 md:p-5"
          :class="[theme.image ? 'text-white' : 'text-slate-900', theme.featured ? 'md:col-span-2 md:min-h-56' : '', !theme.image ? theme.tone : '']"
        >
          <img
            v-if="theme.image"
            :src="theme.image"
            alt=""
            class="absolute inset-0 -z-20 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          >
          <div
            v-else
            class="absolute inset-0 -z-20"
            aria-hidden="true"
          >
            <component :is="theme.icon" :size="42" :stroke-width="1.25" class="absolute right-5 top-5 text-slate-400/70" />
          </div>
          <div v-if="theme.image" class="absolute inset-0 -z-10 bg-slate-950/40" />

          <div class="mt-auto flex w-full items-end justify-between gap-2">
            <div>
              <h3 class="text-[17px] font-semibold tracking-tight md:text-[20px]">{{ theme.title }}</h3>
              <p class="mt-1 line-clamp-2 max-w-sm text-[12px] leading-[1.35] md:text-[13px]" :class="theme.image ? 'text-white/85' : 'text-slate-600'">
                {{ theme.description }}
              </p>
            </div>
            <ArrowUpRight class="mb-0.5 size-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" :class="theme.image ? 'text-white/85' : 'text-slate-500'" aria-hidden="true" />
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
