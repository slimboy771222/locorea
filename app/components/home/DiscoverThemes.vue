<script setup lang="ts">
const themes = [
  { label: 'K-pop', to: '/search?q=k-pop', color: 'from-fuchsia-500 to-violet-700' },
  { label: 'Cafes', to: '/search?q=cafe', color: 'from-amber-400 to-orange-600' },
  { label: 'Shopping', to: '/search?q=shopping', color: 'from-rose-400 to-pink-600' },
  { label: 'Nature', to: '/search?q=nature', color: 'from-emerald-400 to-teal-700' },
  { label: 'History', to: '/search?q=history', color: 'from-stone-400 to-stone-700' },
  { label: 'Family', to: '/search?q=family', color: 'from-sky-400 to-blue-700' },
  { label: 'Festivals', to: '/search?q=festivals', color: 'from-red-400 to-orange-500' },
]
</script>

<template>
  <section class="bg-slate-50/90">
    <div class="mx-auto max-w-7xl px-5 py-9 lg:px-8">
      <div class="mb-5 flex items-end justify-between">
        <div><p class="text-sm font-medium text-blue-600">Find your kind of Korea</p><h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Discover Korea by Theme</h2></div>
        <NuxtLink to="/search?q=Korea" class="text-sm font-medium text-blue-600">Explore all <span aria-hidden="true">→</span></NuxtLink>
      </div>
      <div class="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:px-0">
        <NuxtLink v-for="theme in themes" :key="theme.label" :to="theme.to" class="group relative min-w-40 snap-start overflow-hidden rounded-2xl p-4 text-white shadow-sm lg:min-w-44">
          <div class="absolute inset-0 bg-gradient-to-br" :class="theme.color" />
          <div class="absolute inset-0 bg-slate-950/10 transition group-hover:bg-slate-950/0" />
          <span class="relative block pt-12 text-lg font-bold">{{ theme.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
