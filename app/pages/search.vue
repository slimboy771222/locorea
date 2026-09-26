<script setup lang="ts">
import type { SearchFilters, SearchResults, SearchTab } from '~/composables/useSearch'

const route = useRoute()
const router = useRouter()
const { search } = useSearch()
const emptyResults: SearchResults = { places: [], routes: [], guides: [] }

const queryValue = (key: string) => {
  const value = route.query[key]
  return typeof value === 'string' ? value : ''
}

const query = computed(() => queryValue('q'))
const activeTab = computed<SearchTab>(() => {
  const type = queryValue('type')
  return type === 'places' || type === 'routes' || type === 'guides' ? type : 'all'
})
const filters = computed<SearchFilters>(() => ({
  placeType: queryValue('place_type') || undefined,
  area: queryValue('area') || undefined,
  routeType: queryValue('route_type') || undefined,
  difficulty: queryValue('difficulty') || undefined,
  guideType: queryValue('guide_type') || undefined,
  tag: queryValue('tag') || undefined,
}))
const searchInput = ref(query.value)
watch(query, value => { searchInput.value = value })

const searchState = computed(() => JSON.stringify({ query: query.value, filters: filters.value }))
const { data, pending, error } = await useAsyncData(
  'search-results',
  () => search(query.value, filters.value),
  { default: () => emptyResults, watch: [searchState] },
)

const results = computed(() => data.value ?? emptyResults)
const counts = computed<Record<SearchTab, number>>(() => ({
  all: results.value.places.length + results.value.routes.length + results.value.guides.length,
  places: results.value.places.length,
  routes: results.value.routes.length,
  guides: results.value.guides.length,
}))
const hasResults = computed(() => counts.value[activeTab.value] > 0)
const unique = <T>(values: T[]) => [...new Set(values)]
const filterOptions = computed(() => ({
  placeTypes: unique(results.value.places.map(place => place.placeType)).sort(),
  areas: Object.values(Object.fromEntries(results.value.places.filter(place => place.areaSlug && place.area).map(place => [place.areaSlug!, { slug: place.areaSlug!, name: place.area! }]))).sort((a, b) => a.name.localeCompare(b.name)),
  routeTypes: unique(results.value.routes.map(item => item.routeType)).sort(),
  difficulties: unique(results.value.routes.map(item => item.difficulty).filter((item): item is string => Boolean(item))).sort(),
  guideTypes: unique(results.value.guides.map(item => item.guideType)).sort(),
}))

const setSearchUrl = (next: { query?: string; tab?: SearchTab; filters?: SearchFilters }) => {
  const nextQuery = next.query ?? query.value
  const nextTab = next.tab ?? activeTab.value
  const nextFilters = next.filters ?? filters.value
  const urlQuery: Record<string, string> = {}
  if (nextQuery) urlQuery.q = nextQuery
  if (nextTab !== 'all') urlQuery.type = nextTab
  if (nextFilters.placeType) urlQuery.place_type = nextFilters.placeType
  if (nextFilters.area) urlQuery.area = nextFilters.area
  if (nextFilters.routeType) urlQuery.route_type = nextFilters.routeType
  if (nextFilters.difficulty) urlQuery.difficulty = nextFilters.difficulty
  if (nextFilters.guideType) urlQuery.guide_type = nextFilters.guideType
  if (nextFilters.tag) urlQuery.tag = nextFilters.tag
  return router.push({ path: '/search', query: urlQuery })
}

const submitSearch = () => setSearchUrl({ query: searchInput.value.trim(), tab: 'all', filters: {} })
const selectTab = (tab: SearchTab) => setSearchUrl({ tab, filters: {} })
const clearFilters = () => setSearchUrl({ filters: {} })
const viewAll = (tab: Exclude<SearchTab, 'all'>) => setSearchUrl({ tab, filters: {} })

useSeoMeta({ title: 'Search Korea | Locorea', description: 'Search Locorea for places, routes and practical Korea travel guides.' })
</script>

<template>
  <div class="min-h-screen bg-white">
    <LayoutAppHeader />
    <main>
      <SearchHeader v-model="searchInput" @submit="submitSearch" />
      <section class="mx-auto max-w-7xl px-5 py-7 lg:px-8 lg:py-9">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div><p class="text-sm font-semibold text-slate-900">{{ query ? `Results for “${query}”` : 'Browse Korea travel content' }}</p><p class="mt-1 text-sm text-slate-500">Published places, routes and guides in English.</p></div>
          <p v-if="!pending" class="text-sm text-slate-500">{{ counts.all }} results</p>
        </div>
        <div class="mt-5">
          <SearchTabs :active="activeTab" :counts="counts" @select="selectTab" />
          <SearchFilters :active="activeTab" :filters="filters" v-bind="filterOptions" @update="setSearchUrl({ filters: $event })" />
        </div>
        <div v-if="pending" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="index in 6" :key="index" class="overflow-hidden rounded-2xl border border-slate-100 bg-white"><div class="aspect-[16/9] animate-pulse bg-slate-100" /><div class="space-y-3 p-4"><div class="h-4 w-2/3 animate-pulse rounded bg-slate-100" /><div class="h-3 w-full animate-pulse rounded bg-slate-100" /><div class="h-3 w-4/5 animate-pulse rounded bg-slate-100" /></div></div>
        </div>
        <p v-else-if="error" class="mt-8 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">Search results could not be loaded. Please try again.</p>
        <SearchEmptyState v-else-if="!hasResults" class="mt-8" :query="query || 'your current filters'" @clear="clearFilters" />
        <div v-else-if="activeTab === 'all'" class="mt-8 space-y-10 lg:space-y-12">
          <section v-if="results.places.length"><div class="mb-4 flex items-center justify-between gap-4"><div><p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Places</p><h2 class="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">Places to explore</h2></div><button type="button" class="text-sm font-semibold text-blue-700 hover:text-blue-800" @click="viewAll('places')">View all ({{ counts.places }})</button></div><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><SearchPlaceResultCard v-for="item in results.places.slice(0, 3)" :key="item.id" :item="item" /></div></section>
          <section v-if="results.routes.length"><div class="mb-4 flex items-center justify-between gap-4"><div><p class="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">Routes</p><h2 class="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">Ready-made journeys</h2></div><button type="button" class="text-sm font-semibold text-blue-700 hover:text-blue-800" @click="viewAll('routes')">View all ({{ counts.routes }})</button></div><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><SearchRouteResultCard v-for="item in results.routes.slice(0, 3)" :key="item.id" :item="item" /></div></section>
          <section v-if="results.guides.length"><div class="mb-4 flex items-center justify-between gap-4"><div><p class="text-xs font-semibold uppercase tracking-[0.16em] text-amber-500">Guides</p><h2 class="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">Travel essentials</h2></div><button type="button" class="text-sm font-semibold text-blue-700 hover:text-blue-800" @click="viewAll('guides')">View all ({{ counts.guides }})</button></div><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><SearchGuideResultCard v-for="item in results.guides.slice(0, 3)" :key="item.id" :item="item" /></div></section>
        </div>
        <div v-else class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SearchPlaceResultCard v-for="item in activeTab === 'places' ? results.places : []" :key="item.id" :item="item" />
          <SearchRouteResultCard v-for="item in activeTab === 'routes' ? results.routes : []" :key="item.id" :item="item" />
          <SearchGuideResultCard v-for="item in activeTab === 'guides' ? results.guides : []" :key="item.id" :item="item" />
        </div>
      </section>
    </main>
    <LayoutAppFooter />
  </div>
</template>
