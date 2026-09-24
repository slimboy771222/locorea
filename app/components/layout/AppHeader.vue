<script setup lang="ts">
import {
  Search,
  Heart,
  UserRound,
  Menu,
} from 'lucide-vue-next'
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8"
    >
      <NuxtLink
        to="/"
        class="flex items-center gap-2"
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

      <nav class="hidden items-center gap-8 text-sm font-medium md:flex">
        <NuxtLink to="/places">
          Explore
        </NuxtLink>

        <NuxtLink to="/routes">
          Routes
        </NuxtLink>

        <NuxtLink to="/guides">
          Guides
        </NuxtLink>

        <NuxtLink to="/plan">
          Plan Your Trip
        </NuxtLink>

        <NuxtLink to="/guides/transport">
          Getting Around
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-4">
        <Search :size="20" />

        <Heart
          :size="20"
          class="hidden sm:block"
        />

        <UserRound
          :size="20"
          class="hidden sm:block"
        />

        <Menu
          :size="22"
          class="md:hidden"
        />
      </div>
    </div>
  </header>
</template>