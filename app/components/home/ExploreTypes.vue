<script setup lang="ts">
import {
  BookOpen,
  CalendarDays,
  MapPin,
  Navigation,
  Route,
  Sparkles,
  Utensils,
} from 'lucide-vue-next'

const items = [
  { label: 'Places', to: '/places', icon: MapPin },
  { label: 'Routes', to: '/routes', icon: Route },
  { label: 'Food', to: '/search?q=food', icon: Utensils },
  { label: 'Themes', to: '/search?q=theme', icon: Sparkles },
  { label: 'Guides', to: '/guides', icon: BookOpen },
  { label: 'Events', to: '/search?q=events', icon: CalendarDays },
  { label: 'Nearby', to: '/search?q=nearby', icon: Navigation },
]
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-8 md:py-10 lg:px-8">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-blue-600">Browse the essentials</p>
        <h2 class="mt-1 text-[22px] font-bold tracking-tight text-slate-950 md:text-[26px]">
          Explore by Type
        </h2>
      </div>

      <NuxtLink to="/search" class="text-sm font-medium text-slate-600 transition hover:text-blue-600">
        View all <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
      <NuxtLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="group flex min-h-24 flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 transition hover:border-blue-200 hover:shadow-sm"
      >
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
          <component :is="item.icon" :size="19" />
        </span>
        <span class="mt-4 text-sm font-semibold text-slate-800">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </section>
</template>
