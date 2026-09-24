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
    class="relative overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200"
  >
    <div
      class="mx-auto flex min-h-[390px] max-w-7xl flex-col justify-center px-5 py-16 lg:px-8"
    >
      <div class="max-w-3xl">
        <h1
          class="text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl"
        >
          Explore Korea
          <br>
          with confidence.
        </h1>

        <p
          class="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg"
        >
          Find places, routes, food and practical travel help
          for your Korea trip.
        </p>

        <form
          class="mt-8 flex max-w-3xl rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-200"
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
              class="w-full border-0 bg-transparent px-4 py-3 text-base outline-none"
            >
          </div>

          <button
            type="submit"
            class="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        <div class="mt-4 flex flex-wrap gap-2">
          <span class="mr-1 py-2 text-sm text-slate-500">
            Try searching:
          </span>

          <button
            v-for="item in popularQueries"
            :key="item"
            type="button"
            class="rounded-full bg-white/90 px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 transition hover:bg-white"
            @click="searchKeyword(item)"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>