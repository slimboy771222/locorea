<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { discovery } from '~/config/discovery'
</script>

<template>
  <section class="bg-slate-50/90">
    <div class="mx-auto max-w-7xl px-5 py-9 lg:px-8">
      <div class="mb-5">
        <p class="text-sm font-medium text-blue-600">Plan your trip</p>
        <h2 class="mt-1 text-[22px] font-bold tracking-tight text-slate-950 md:text-[26px]">Korea Travel Essentials</h2>
        <p class="mt-1 text-[15px] leading-6 text-slate-500">Practical guides for a smoother arrival and stay.</p>
      </div>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <NuxtLink v-for="guide in discovery.travelEssentials" :key="guide.guideType" :to="guide.to" class="group rounded-xl border border-slate-200/90 bg-white p-4 transition hover:border-blue-200 hover:shadow-md">
          <div class="flex gap-3">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-50">
              <component :is="guide.icon" :size="20" class="text-blue-600" />
            </div>
            <div class="min-w-0"><p class="text-[13px] font-medium text-slate-400">Guide</p>
              <h3 class="mt-1 text-[15px] font-semibold leading-5 text-slate-900">{{ guide.label }}</h3>
            </div>
          </div>
          <p class="mt-3 text-sm leading-5 text-slate-500">{{ guide.description }}</p>
          <ArrowUpRight :size="17" class="mt-3 text-slate-400 transition group-hover:text-blue-600" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
