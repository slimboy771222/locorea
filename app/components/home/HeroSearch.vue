<script setup lang="ts">
import { Search } from 'lucide-vue-next'

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
    class="relative isolate min-h-[540px] overflow-hidden border-b border-slate-900 bg-[linear-gradient(90deg,#716765_0%,#665B54_45%,#584C42_100%)] sm:min-h-[550px] lg:min-h-[580px]"
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
      class="mx-auto flex min-h-[540px] max-w-7xl items-center px-5 py-8 sm:min-h-[550px] sm:py-10 lg:min-h-[580px] lg:px-8 lg:py-14"
    >
      <div class="w-full max-w-xl sm:max-w-2xl lg:max-w-[60%]">
        <p class="text-sm font-semibold tracking-[0.01em] text-blue-100">
          Explore Korea your way
        </p>
        <h1
          class="mt-2.5 max-w-3xl text-[clamp(2.5rem,10vw,2.75rem)] font-bold leading-[1.07] tracking-[-0.04em] text-white sm:mt-3 sm:text-5xl sm:leading-[1.04] md:text-6xl"
        >
          <span class="block">Discover Korea</span>
          <span class="block sm:whitespace-nowrap">beyond the obvious</span>
        </h1>

        <p
          class="mt-3 max-w-2xl text-[15px] leading-6 text-slate-100 sm:mt-4 sm:text-base sm:leading-7 md:text-lg"
        >
          Find places, routes, local food, and practical guides for exploring Korea with confidence.
        </p>

        <form
          class="mt-5 flex max-w-3xl rounded-2xl bg-white p-1.5 shadow-lg shadow-slate-950/20 ring-1 ring-white/70 focus-within:ring-2 focus-within:ring-blue-200 sm:mt-6"
          @submit.prevent="submitSearch"
        >
          <div class="flex flex-1 items-center px-2.5 sm:px-3">
            <Search
              :size="20"
              class="shrink-0 text-slate-400"
            />

            <input
              v-model="query"
              type="search"
              placeholder="Search places, routes, food, or travel questions"
              class="w-full border-0 bg-transparent px-2 py-3 text-[15px] outline-none placeholder:text-slate-400 sm:px-3 sm:py-3.5 sm:text-base"
            >
          </div>

          <button
            type="submit"
            class="rounded-xl bg-blue-600 px-3.5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-5 sm:py-3.5 sm:text-base"
          >
            Search
          </button>
        </form>

        <div class="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
          <NuxtLink
            v-for="item in suggestions"
            :key="item.label"
            :to="item.to"
            class="rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-medium text-slate-700 ring-1 ring-white/70 transition hover:bg-white hover:text-blue-700 sm:px-3.5 sm:py-1.5 sm:text-sm"
          >
            {{ item.label }}
          </NuxtLink>
        </div>

        <p class="mt-3 max-w-2xl text-[13px] leading-5 text-slate-100 sm:mt-4 sm:text-sm">
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
