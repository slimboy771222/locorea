<script setup lang="ts">
import { Phone, Stethoscope, Search, CircleHelp, HandHeart } from 'lucide-vue-next'

const utilities = [
  { label: 'Emergency', description: 'Essential emergency information', to: '/search?q=emergency+Korea', icon: Phone },
  { label: 'Medical', description: 'Find care and pharmacy help', to: '/search?q=medical+help+Korea', icon: Stethoscope },
  { label: 'Lost & Found', description: 'What to do when items go missing', to: '/search?q=lost+and+found+Korea', icon: Search },
  { label: 'Travel Help', description: 'Answers for common travel questions', to: '/search?q=travel+help+Korea', icon: CircleHelp },
  { label: 'Travel Etiquette', description: 'Know before you go', to: '/search?q=Korea+travel+etiquette', icon: HandHeart },
]
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-9 lg:px-8">
    <div class="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 md:p-7">
      <div class="max-w-xl"><p class="text-sm font-medium text-blue-700">Useful when you need it</p><h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Need Help in Korea?</h2><p class="mt-1 text-sm text-slate-600">Quick links to practical support and local know-how.</p></div>
      <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <NuxtLink v-for="item in utilities" :key="item.label" :to="item.to" class="group rounded-2xl border border-white bg-white/90 p-4 transition hover:border-blue-200 hover:shadow-md">
          <component :is="item.icon" :size="21" class="text-blue-600" /><h3 class="mt-4 font-semibold text-slate-900">{{ item.label }}</h3><p class="mt-1 text-xs leading-5 text-slate-500">{{ item.description }}</p>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
