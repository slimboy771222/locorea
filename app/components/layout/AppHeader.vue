<script setup lang="ts">
import {
  Search,
  Menu,
  X,
} from 'lucide-vue-next'

const mobileMenuOpen = ref(false)

let previousBodyOverflow = ''

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMobileMenu()
  }
}

watch(mobileMenuOpen, (isOpen) => {
  if (!import.meta.client) {
    return
  }

  if (isOpen) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return
  }

  document.body.style.overflow = previousBodyOverflow
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-200/60 bg-white/92 backdrop-blur-md">
    <div
      class="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-5 sm:h-16 lg:h-[70px] lg:px-8"
    >
      <NuxtLink
        to="/"
        class="flex items-center"
      >
        <img
          src="/brand/locorea-wordmark-primary.png"
          alt="Locorea"
          class="h-7 w-auto object-contain lg:h-8"
        >
      </NuxtLink>

      <nav class="hidden items-center gap-5 text-[15px] font-medium text-slate-600 lg:flex">
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

      <div class="flex items-center gap-1 sm:gap-2">
        <NuxtLink to="/search" aria-label="Search" class="inline-flex size-11 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 lg:size-10">
          <Search :size="20" />
        </NuxtLink>
        <button type="button" class="inline-flex size-11 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 lg:hidden" :aria-expanded="mobileMenuOpen" aria-controls="mobile-navigation" aria-label="Toggle navigation" @click="toggleMobileMenu">
          <X v-if="mobileMenuOpen" :size="22" />
          <Menu v-else :size="22" />
        </button>
      </div>
    </div>
    <div v-if="mobileMenuOpen" class="fixed inset-0 z-[60] lg:hidden">
      <button type="button" class="absolute inset-0 cursor-default bg-slate-950/20" aria-label="Close navigation" @click="closeMobileMenu" />
      <nav id="mobile-navigation" aria-label="Mobile navigation" class="absolute inset-x-0 top-[60px] border-y border-slate-200 bg-white px-5 py-3 shadow-lg shadow-slate-950/10">
        <div class="mb-1 flex h-11 items-center justify-between px-3">
          <span class="text-sm font-semibold text-slate-900">Menu</span>
          <button type="button" class="inline-flex size-11 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" aria-label="Close navigation" @click="closeMobileMenu">
            <X :size="22" />
          </button>
        </div>
        <div class="grid gap-1 text-sm font-medium text-slate-700">
          <NuxtLink to="/places" class="flex min-h-11 items-center rounded-lg px-3 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="closeMobileMenu">Explore</NuxtLink>
          <NuxtLink to="/routes" class="flex min-h-11 items-center rounded-lg px-3 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="closeMobileMenu">Routes</NuxtLink>
          <NuxtLink to="/guides" class="flex min-h-11 items-center rounded-lg px-3 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="closeMobileMenu">Guides</NuxtLink>
          <NuxtLink to="/search?q=getting+around" class="flex min-h-11 items-center rounded-lg px-3 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="closeMobileMenu">Getting Around</NuxtLink>
          <NuxtLink to="/#need-help" class="flex min-h-11 items-center rounded-lg px-3 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="closeMobileMenu">Help</NuxtLink>
        </div>
      </nav>
    </div>
  </header>
</template>
