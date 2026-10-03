<script setup lang="ts">
import { ArrowRight, LifeBuoy, Search } from 'lucide-vue-next'

const query = ref('')
const heroImagePath = '/images/hero/locorea-seoul-hero.png'

const suggestions = [
  { label: 'Seongsu', to: '/search?q=Seongsu' },
  { label: 'Korean food', to: '/search?type=places&place_type=restaurant' },
  { label: 'Cafes', to: '/search?type=places&place_type=cafe' },
  { label: 'Shopping', to: '/search?type=places&place_type=shopping' },
  { label: 'First time in Korea', to: '/search?type=guides&tag=first-trip' },
  { label: 'Seoul Forest', to: '/search?q=Seoul+Forest' },
]

const submitSearch = () => {
  const keyword = query.value.trim()

  if (!keyword) {
    return
  }

  navigateTo({
    path: '/search',
    query: {
      q: keyword,
    },
  })
}

</script>

<template>
  <section
    class="relative isolate min-h-[450px] overflow-hidden border-b border-slate-900 bg-[linear-gradient(90deg,#716765_0%,#665B54_45%,#584C42_100%)] sm:min-h-[550px] lg:min-h-[580px]"
  >
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <img
        :src="heroImagePath"
        alt=""
        class="absolute inset-0 h-full w-full scale-[1.06] object-cover object-center opacity-95 blur-[28px] brightness-[1.02] saturate-[1.02]"
        aria-hidden="true"
      >
      <div
        class="hero-sharp absolute inset-y-0 left-1/2 z-10 w-full max-w-[2172px] -translate-x-1/2 overflow-hidden"
      >
        <img
          :src="heroImagePath"
          alt=""
          class="h-full w-full object-cover object-[62%_center] brightness-[1.06] saturate-[1.04] md:object-[60%_center] lg:object-[65%_center]"
          fetchpriority="high"
          decoding="async"
        >
      </div>
      <div
        class="absolute inset-0 z-20 bg-[linear-gradient(to_right,rgba(10,18,30,0.28)_0%,rgba(10,18,30,0.24)_58%,rgba(10,18,30,0.14)_100%)] lg:bg-[linear-gradient(to_right,rgba(10,18,30,0.30)_0%,rgba(10,18,30,0.19)_28%,rgba(10,18,30,0.06)_52%,transparent_68%)]"
      />
    </div>

    <div
      class="mx-auto flex min-h-[450px] max-w-7xl items-center px-5 py-6 sm:min-h-[550px] sm:py-10 lg:min-h-[580px] lg:px-8 lg:py-14"
    >
      <div class="w-full max-w-xl sm:max-w-2xl lg:max-w-[60%]">
        <p class="text-sm font-semibold tracking-[0.01em] text-blue-100">
          Explore Korea your way
        </p>
        <h1
          class="mt-2.5 max-w-3xl text-[clamp(1.875rem,8.5vw,2.125rem)] font-bold leading-[1.08] tracking-[-0.04em] text-white sm:mt-3 sm:text-5xl sm:leading-[1.04] md:text-6xl"
        >
          <span class="block">Discover Korea</span>
          <span class="block sm:whitespace-nowrap">beyond the obvious</span>
        </h1>

        <p
          class="mt-3 max-w-2xl text-base leading-6 text-slate-100 sm:mt-4 sm:leading-7 md:text-lg"
        >
          <span class="sm:hidden">Find places, routes, food, and practical travel help.</span>
          <span class="hidden sm:inline">Find places, routes, local food, and practical guides for exploring Korea with confidence.</span>
        </p>

        <form
          class="mt-5 flex max-w-3xl rounded-2xl bg-white p-1 shadow-lg shadow-slate-950/20 ring-1 ring-white/70 focus-within:ring-2 focus-within:ring-blue-200 sm:mt-6 sm:p-1.5"
          @submit.prevent="submitSearch"
        >
          <div class="flex min-w-0 flex-1 items-center px-2.5 sm:px-3">
            <Search
              :size="20"
              class="hidden shrink-0 text-slate-400 sm:block"
            />

            <input
              v-model="query"
              type="search"
              placeholder="Search Korea"
              class="w-full border-0 bg-transparent px-2 py-2 text-base outline-none placeholder:text-slate-400 sm:px-3 sm:py-3.5"
            >
          </div>

          <button
            type="submit"
            aria-label="Search"
            class="inline-flex size-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:size-auto sm:px-5 sm:py-3.5 sm:text-base"
          >
            <Search :size="19" class="sm:hidden" aria-hidden="true" />
            <span class="hidden sm:inline">Search</span>
          </button>
        </form>

        <div class="mt-3 flex max-w-full snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-4 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:pb-0">
          <NuxtLink
            v-for="item in suggestions"
            :key="item.label"
            :to="item.to"
            class="inline-flex h-8 shrink-0 snap-start items-center rounded-full bg-white/95 px-3 text-[13px] font-medium text-slate-700 ring-1 ring-white/70 transition hover:bg-white hover:text-blue-700 sm:h-auto sm:px-3.5 sm:py-1.5 sm:text-sm"
          >
            {{ item.label }}
          </NuxtLink>
        </div>

        <NuxtLink to="/#need-help" class="mt-3 flex min-h-12 w-full max-w-[430px] items-center gap-2.5 rounded-xl bg-white/95 px-3.5 text-slate-800 ring-1 ring-white/70 transition hover:bg-white hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-100 sm:mt-4 sm:inline-flex sm:min-h-11 sm:w-auto">
          <LifeBuoy :size="18" class="shrink-0 text-blue-700" aria-hidden="true" />
          <span class="min-w-0 flex-1">
            <span class="block whitespace-nowrap text-[15px] font-semibold sm:inline">Need help<span class="sm:hidden">?</span><span class="hidden sm:inline"> in Korea?</span></span>
            <span class="hidden text-xs font-medium text-slate-500 min-[390px]:block sm:ml-2 sm:inline">Emergency · Medical · Lost</span>
          </span>
          <ArrowRight :size="18" class="shrink-0 text-slate-400" aria-hidden="true" />
        </NuxtLink>

        <p class="mt-3 hidden max-w-2xl text-[13px] leading-5 text-slate-100 sm:mt-4 sm:block sm:text-sm">
          Curated places, practical travel knowledge, and local routes for exploring Korea with confidence.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (min-width: 2173px) {
  .hero-sharp {
    -webkit-mask-image: linear-gradient(to right, transparent 0, #000 96px, #000 calc(100% - 96px), transparent 100%);
    mask-image: linear-gradient(to right, transparent 0, #000 96px, #000 calc(100% - 96px), transparent 100%);
  }
}
</style>
