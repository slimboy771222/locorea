<script setup lang="ts">
import {
  Search,
  Menu,
  X,
} from 'lucide-vue-next'

const mobileMenuOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur">
    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8"
    >
      <NuxtLink
        to="/"
        class="flex items-center gap-2 text-slate-950"
      >
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white"
        >
          L
        </div>

        <span class="text-xl font-bold tracking-tight">
          Locorea
        </span>
      </NuxtLink>

      <nav class="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
        <NuxtLink to="/places" class="transition hover:text-slate-950">
          Explore
        </NuxtLink>

        <NuxtLink to="/routes" class="transition hover:text-slate-950">
          Routes
        </NuxtLink>

        <NuxtLink to="/guides" class="transition hover:text-slate-950">
          Guides
        </NuxtLink>

        <NuxtLink to="/guides" class="transition hover:text-slate-950">
          Plan Your Trip
        </NuxtLink>

        <NuxtLink to="/search?q=getting+around" class="transition hover:text-slate-950">
          Getting Around
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <NuxtLink to="/search" aria-label="Search" class="rounded-lg p-2 text-slate-700 hover:bg-slate-100">
          <Search :size="20" />
        </NuxtLink>
        <button type="button" class="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden" :aria-expanded="mobileMenuOpen" aria-label="Toggle navigation" @click="mobileMenuOpen = !mobileMenuOpen">
          <X v-if="mobileMenuOpen" :size="22" />
          <Menu v-else :size="22" />
        </button>
      </div>
    </div>
    <nav v-if="mobileMenuOpen" class="border-t border-slate-100 bg-white px-5 py-3 lg:hidden">
      <div class="grid gap-1 text-sm font-medium text-slate-700">
        <NuxtLink to="/places" class="rounded-lg px-3 py-2 hover:bg-slate-50" @click="mobileMenuOpen = false">Explore</NuxtLink>
        <NuxtLink to="/routes" class="rounded-lg px-3 py-2 hover:bg-slate-50" @click="mobileMenuOpen = false">Routes</NuxtLink>
        <NuxtLink to="/guides" class="rounded-lg px-3 py-2 hover:bg-slate-50" @click="mobileMenuOpen = false">Guides</NuxtLink>
        <NuxtLink to="/search?q=getting+around" class="rounded-lg px-3 py-2 hover:bg-slate-50" @click="mobileMenuOpen = false">Getting Around</NuxtLink>
      </div>
    </nav>
  </header>
</template>
