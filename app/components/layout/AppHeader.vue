<script setup lang="ts">
import {
  BookOpen,
  ChevronRight,
  Info,
  LifeBuoy,
  MapPin,
  Search,
  Menu,
  UserRound,
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
        <NuxtLink to="/search" aria-label="Search" class="hidden size-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 lg:inline-flex">
          <Search :size="20" />
        </NuxtLink>
        <button type="button" class="inline-flex size-11 items-center justify-end rounded-xl text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 lg:hidden" :aria-expanded="mobileMenuOpen" aria-controls="mobile-navigation" aria-label="Open navigation" @click="toggleMobileMenu">
          <Menu :size="22" />
        </button>
      </div>
    </div>
    <div v-if="mobileMenuOpen" class="fixed inset-0 z-[60] lg:hidden">
      <button type="button" class="absolute inset-0 cursor-default bg-slate-950/35" aria-label="Close navigation" tabindex="-1" @click="closeMobileMenu" />
      <aside id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Mobile navigation" class="absolute inset-y-0 right-0 flex h-[100dvh] w-[86vw] max-w-[420px] flex-col overflow-y-auto bg-white px-5 pb-6 shadow-2xl shadow-slate-950/20">
        <div class="flex h-16 shrink-0 items-center justify-end">
          <button type="button" class="inline-flex size-11 items-center justify-center rounded-full bg-slate-50 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" aria-label="Close navigation" @click="closeMobileMenu">
            <X :size="22" />
          </button>
        </div>
        <section class="flex min-h-[72px] items-center rounded-xl bg-slate-50 px-3 py-3" aria-label="Account">
          <div class="flex items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">
              <UserRound :size="19" aria-hidden="true" />
            </div>
            <div class="min-w-0">
              <p class="text-[15px] font-semibold text-slate-900">Sign in to Locorea</p>
              <p class="mt-0.5 text-sm leading-5 text-slate-500">Save places and guides</p>
            </div>
          </div>
        </section>

        <nav class="mt-5" aria-label="Primary navigation">
          <div class="grid gap-1.5 text-base font-semibold">
            <NuxtLink to="/search?type=places" class="flex min-h-12 items-center justify-between rounded-xl bg-blue-50 px-3 text-slate-900 transition hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="closeMobileMenu"><span class="flex items-center gap-3"><MapPin :size="19" class="text-blue-700" aria-hidden="true" />Discover</span><ChevronRight :size="18" class="text-slate-400" aria-hidden="true" /></NuxtLink>
            <NuxtLink to="/search?type=guides" class="flex min-h-12 items-center justify-between rounded-xl px-3 text-slate-800 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="closeMobileMenu"><span class="flex items-center gap-3"><BookOpen :size="19" class="text-slate-500" aria-hidden="true" />Guides</span><ChevronRight :size="18" class="text-slate-400" aria-hidden="true" /></NuxtLink>
            <NuxtLink to="/#need-help" class="flex min-h-12 items-center justify-between rounded-xl px-3 text-slate-800 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="closeMobileMenu"><span class="flex items-center gap-3"><LifeBuoy :size="19" class="text-slate-500" aria-hidden="true" />Help</span><ChevronRight :size="18" class="text-slate-400" aria-hidden="true" /></NuxtLink>
          </div>
        </nav>

        <nav class="mt-5 border-t border-slate-200 pt-3" aria-label="Secondary navigation">
          <NuxtLink to="/" class="flex min-h-12 items-center justify-between rounded-xl px-3 text-[15px] font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="closeMobileMenu">
            <span class="flex items-center gap-3"><Info :size="19" class="text-slate-400" aria-hidden="true" />About Locorea</span>
            <ChevronRight :size="18" class="text-slate-400" aria-hidden="true" />
          </NuxtLink>
        </nav>
      </aside>
    </div>
  </header>
</template>
