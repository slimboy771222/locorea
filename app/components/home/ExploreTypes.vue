<script setup lang="ts">
import {
  MapPin,
  Route,
  Utensils,
  Sparkles,
  BookOpen,
  CalendarDays,
  Navigation,
} from 'lucide-vue-next'

const items = [
  {
    label: 'Places',
    description: 'Explore places',
    to: '/places',
    icon: MapPin,
  },
  {
    label: 'Routes',
    description: 'Travel routes',
    to: '/routes',
    icon: Route,
  },
  {
    label: 'Food',
    description: 'Food & cafes',
    to: '/places?type=restaurant',
    icon: Utensils,
  },
  {
    label: 'Themes',
    description: 'Travel themes',
    to: '/themes',
    icon: Sparkles,
  },
  {
    label: 'Guides',
    description: 'Practical help',
    to: '/guides',
    icon: BookOpen,
  },
  {
    label: 'Events',
    description: 'What is happening',
    to: '/events',
    icon: CalendarDays,
  },
  {
    label: 'Nearby',
    description: 'Find around you',
    to: '/nearby',
    icon: Navigation,
  },
]
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-10 lg:px-8">
    <div class="mb-5 flex items-center justify-between">
      <h2 class="text-2xl font-bold">
        Explore by Type
      </h2>

      <NuxtLink
        to="/search"
        class="text-sm font-medium text-blue-600"
      >
        View all →
      </NuxtLink>
    </div>

    <div
      class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
    >
      <NuxtLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="group rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:-translate-y-1 hover:shadow-md"
      >
        <component
          :is="item.icon"
          :size="28"
          class="mx-auto text-blue-600"
        />

        <div class="mt-3 font-semibold">
          {{ item.label }}
        </div>

        <div class="mt-1 text-xs text-slate-500">
          {{ item.description }}
        </div>
      </NuxtLink>
    </div>
  </section>
</template>