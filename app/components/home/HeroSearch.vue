<script setup lang="ts">
import { Search } from 'lucide-vue-next'

const query = ref('')

const popularQueries = [
  'Seongsu cafe',
  'T-money card',
  '3 days in Busan',
  'SIM card',
  'Seoul subway',
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

const searchKeyword = (keyword: string) => {
  query.value = keyword
  submitSearch()
}
</script>

<template>
  <section
    class="relative overflow-hidden border-b border-slate-100 bg-blue-50/55"
  >
    <div
      class="mx-auto flex min-h-[288px] max-w-7xl flex-col justify-center px-5 py-8 md:min-h-[365px] md:py-14 lg:px-8"
    >
      <div class="max-w-3xl">
        <h1
          class="text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 md:text-6xl"
        >
          Explore Korea
          <br>
          with confidence.
        </h1>

        <p
          class="mt-4 max-w-xl text-base leading-7 text-slate-600 md:text-lg"
        >
          Find places, routes, food and practical travel help
          for your Korea trip.
        </p>

        <form
          class="mt-7 flex max-w-3xl rounded-2xl bg-white p-1.5 shadow-md shadow-slate-300/25 ring-1 ring-slate-200"
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
              placeholder="What do you want to know about Korea?"
              class="w-full border-0 bg-transparent px-3 py-3 text-base outline-none placeholder:text-slate-400"
            >
          </div>

          <button
            type="submit"
            class="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-7"
          >
            Search
          </button>
        </form>

        <div class="mt-4 flex flex-wrap gap-2">
          <span class="mr-1 py-1.5 text-sm text-slate-500">
            Try searching:
          </span>

          <button
            v-for="item in popularQueries"
            :key="item"
            type="button"
            class="rounded-full bg-white px-3.5 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:border-blue-200 hover:text-blue-700"
            @click="searchKeyword(item)"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
