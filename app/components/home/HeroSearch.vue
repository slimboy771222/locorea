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
    class="relative isolate min-h-[520px] overflow-hidden border-b border-slate-900 bg-[#081224] lg:min-h-[560px]"
  >
    <div
      class="absolute inset-y-0 left-1/2 -z-10 w-full max-w-[1800px] -translate-x-1/2 overflow-hidden"
    >
      <img
        :src="heroImagePath"
        alt=""
        class="h-full w-full object-cover object-[64%_center] lg:object-[65%_center]"
        fetchpriority="high"
        decoding="async"
      >
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,rgba(8,18,36,0.84)_0%,rgba(8,18,36,0.60)_45%,rgba(8,18,36,0.58)_70%,rgba(8,18,36,0.84)_100%)] lg:bg-[linear-gradient(to_right,rgba(8,18,36,1)_0%,rgba(8,18,36,0.80)_14%,rgba(8,18,36,0.52)_45%,rgba(8,18,36,0.12)_72%,rgba(8,18,36,0.68)_90%,rgba(8,18,36,1)_100%)]"
      />
    </div>

    <div
      class="mx-auto flex min-h-[520px] max-w-7xl items-center px-5 py-9 sm:py-12 lg:min-h-[560px] lg:px-8 lg:py-14"
    >
      <div class="w-full max-w-3xl lg:max-w-[60%]">
        <p class="text-sm font-semibold tracking-[0.01em] text-blue-100">
          Explore Korea your way
        </p>
        <h1
          class="mt-3 max-w-3xl text-[38px] font-bold leading-[1.04] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl"
        >
          Discover Korea beyond
          <span class="block">the obvious</span>
        </h1>

        <p
          class="mt-4 max-w-2xl text-[15px] leading-6 text-slate-100 sm:text-base sm:leading-7 md:text-lg"
        >
          Find places, routes, local food, and practical guides for exploring Korea with confidence.
        </p>

        <form
          class="mt-7 flex max-w-3xl rounded-2xl bg-white p-1.5 shadow-lg shadow-slate-950/25 ring-1 ring-white/70 focus-within:ring-2 focus-within:ring-blue-200"
          @submit.prevent="submitSearch"
        >
          <div class="flex flex-1 items-center px-3">
            <Search
              :size="22"
              class="shrink-0 text-slate-400"
            />

            <input
              v-model="query"
              type="search"
              placeholder="Search places, routes, food, or travel questions"
              class="w-full border-0 bg-transparent px-3 py-3.5 text-[15px] outline-none placeholder:text-slate-400 sm:text-base"
            >
          </div>

          <button
            type="submit"
            class="rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-7 sm:text-base"
          >
            Search
          </button>
        </form>

        <div class="mt-4 flex flex-wrap gap-2">
          <NuxtLink
            v-for="item in suggestions"
            :key="item.label"
            :to="item.to"
            class="rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-medium text-slate-700 ring-1 ring-white/70 transition hover:bg-white hover:text-blue-700 sm:px-3.5 sm:text-sm"
          >
            {{ item.label }}
          </NuxtLink>
        </div>

        <p class="mt-4 max-w-2xl text-[13px] leading-5 text-slate-100 sm:text-sm">
          Curated places, practical travel knowledge, and local routes for exploring Korea with confidence.
        </p>
      </div>
    </div>
  </section>
</template>
