<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { discovery } from '~/config/discovery'
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
    <div class="rounded-3xl border border-blue-100 bg-blue-50/75 p-5 md:p-7 lg:p-8">
      <div class="max-w-xl">
        <p class="text-sm font-semibold text-blue-700">When something goes wrong</p>
        <h2 class="mt-1.5 text-[24px] font-bold tracking-tight text-slate-950 md:text-[28px]">Need Help in Korea?</h2>
        <p class="mt-2 text-[15px] leading-6 text-slate-600">Practical help for when your trip doesn't go as planned.</p>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <NuxtLink
          v-for="item in discovery.help"
          :key="item.label"
          :to="item.to"
          class="group flex min-h-36 flex-col rounded-2xl border border-white bg-white p-4 outline-none transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <component :is="item.icon" :size="19" aria-hidden="true" />
            </span>
            <ArrowUpRight class="size-4 text-slate-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-700" aria-hidden="true" />
          </div>
          <h3 class="mt-4 text-[15px] font-semibold tracking-tight text-slate-900">{{ item.label }}</h3>
          <p class="mt-1.5 text-[13px] leading-5 text-slate-600">{{ item.description }}</p>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
