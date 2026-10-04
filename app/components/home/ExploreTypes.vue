<script setup lang="ts">
import { discovery } from '~/config/discovery'
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-8 md:py-10 lg:px-8">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold text-blue-700">Browse the essentials</p>
        <h2 class="mt-1.5 text-[24px] font-bold tracking-tight text-slate-950 md:text-[28px]">
          Explore by Interest
        </h2>
      </div>

      <NuxtLink to="/search" class="shrink-0 text-sm font-semibold text-blue-700 transition hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
        View all <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>

    <div class="grid max-w-[720px] grid-cols-3 gap-2.5 sm:gap-3 lg:max-w-6xl lg:grid-cols-6">
      <NuxtLink
        v-for="item in discovery.exploreTypes"
        :key="item.key"
        :to="item.to"
        class="group flex min-h-[84px] flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white px-3 py-3 text-center transition hover:border-blue-200 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <span class="flex size-11 items-center justify-center rounded-xl transition" :class="[item.iconBackgroundClass, item.iconClass]">
          <component :is="item.icon" :size="24" aria-hidden="true" />
        </span>
        <span class="mt-2 text-[15px] font-semibold leading-5 text-slate-800">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </section>
</template>
