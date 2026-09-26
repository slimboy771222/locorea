<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { discovery } from '~/config/discovery'
</script>

<template>
  <section id="travel-basics" class="border-b border-slate-100 bg-slate-50/70">
    <div class="mx-auto max-w-7xl px-5 py-9 sm:py-10 lg:px-8 lg:py-12">
      <div class="max-w-2xl">
        <p class="text-sm font-medium text-blue-700">Good to know before you go</p>
        <h2 class="mt-1 text-[22px] font-bold tracking-tight text-slate-950 md:text-[26px]">Korea Travel Basics</h2>
        <p class="mt-1 text-[15px] leading-6 text-slate-600">The things most travelers want to figure out first.</p>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="item in discovery.travelBasics"
          :key="item.guideType"
          :to="item.to"
          class="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:p-4"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-100">
            <component :is="item.icon" :size="19" />
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="text-[15px] font-semibold leading-5 text-slate-900">{{ item.title }}</h3>
            <p class="mt-0.5 text-[13px] leading-5 text-slate-500">{{ item.description }}</p>
          </div>

          <ArrowUpRight :size="18" class="shrink-0 text-slate-400 transition group-hover:text-blue-600" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
