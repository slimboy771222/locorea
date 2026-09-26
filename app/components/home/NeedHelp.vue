<script setup lang="ts">
import { discovery } from '~/config/discovery'
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-9 lg:px-8">
    <div class="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 md:p-7">
      <div class="max-w-xl"><p class="text-sm font-medium text-blue-700">Useful when you need it</p><h2 class="mt-1 text-[22px] font-bold tracking-tight text-slate-950 md:text-[26px]">Need Help in Korea?</h2><p class="mt-1 text-[15px] leading-6 text-slate-600">Quick links to practical support and local know-how.</p></div>
      <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <NuxtLink v-for="item in discovery.help" :key="item.label" :to="item.to" class="group rounded-2xl border border-white bg-white/90 p-4 transition hover:border-blue-200 hover:shadow-md">
          <component :is="item.icon" :size="21" class="text-blue-600" /><h3 class="mt-4 font-semibold text-slate-900">{{ item.label }}</h3><p class="mt-1 text-sm leading-5 text-slate-500">{{ item.description }}</p>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
