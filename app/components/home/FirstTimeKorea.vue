<script setup lang="ts">
import { discovery } from '~/config/discovery'
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-9 lg:px-8">
    <div class="mb-5">
      <p class="text-sm font-medium text-blue-600">A simple starting point</p>
      <h2 class="mt-1 text-[22px] font-bold tracking-tight text-slate-950 md:text-[26px]">First Time in Korea</h2>
      <p class="mt-1 text-[15px] leading-6 text-slate-500">Six practical steps from arrival to your first day out.</p>
    </div>
    <ol class="relative -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-2 lg:overflow-visible lg:px-0 lg:before:absolute lg:before:top-8 lg:before:right-[8%] lg:before:left-[8%] lg:before:h-px lg:before:bg-slate-200">
      <li v-for="(step, index) in discovery.firstTime" :key="step.label" class="min-w-48 snap-start lg:min-w-0">
        <NuxtLink :to="step.to" class="group relative block h-full rounded-xl border border-slate-200/90 bg-white p-4 transition hover:border-blue-200 hover:shadow-md">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-blue-600">0{{ index + 1 }}</span>
            <component :is="step.icon" :size="20" class="text-slate-400 group-hover:text-blue-600" />
          </div>
          <h3 class="mt-6 text-[15px] font-semibold leading-5 text-slate-900">{{ step.label }}</h3>
        </NuxtLink>
      </li>
    </ol>
  </section>
</template>
