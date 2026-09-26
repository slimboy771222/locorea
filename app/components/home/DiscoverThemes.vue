<script setup lang="ts">
import { discovery } from '~/config/discovery'
</script>

<template>
  <section class="bg-slate-50/90">
    <div class="mx-auto max-w-7xl px-5 py-9 lg:px-8">
      <div class="mb-5 flex items-end justify-between">
        <div><p class="text-sm font-medium text-blue-600">Find your kind of Korea</p><h2 class="mt-1 text-[22px] font-bold tracking-tight text-slate-950 md:text-[26px]">Discover Korea by Theme</h2></div>
        <NuxtLink to="/search?q=Korea" class="text-sm font-medium text-blue-600">Explore all <span aria-hidden="true">→</span></NuxtLink>
      </div>
      <div class="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:px-0">
        <NuxtLink v-for="theme in discovery.themes" :key="theme.tag" :to="theme.to" class="group relative min-w-44 snap-start overflow-hidden rounded-xl p-4 text-white shadow-sm lg:min-w-48">
          <div class="absolute inset-0 bg-gradient-to-br" :class="theme.color" />
          <div class="absolute inset-0 bg-slate-950/10 transition group-hover:bg-slate-950/0" />
          <span class="relative block pt-14 text-lg font-bold">{{ theme.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
