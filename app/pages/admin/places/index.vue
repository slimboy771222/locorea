<script setup lang="ts">
definePageMeta({
  middleware: 'admin-auth',
})

const navigationOpen = ref(false)
const search = ref('')
const selectedStatus = ref('all')
const selectedType = ref('all')
const { getAdminPlaces } = useAdminPlaces()

const { data: places, pending, error } = await useAsyncData(
  'admin-places',
  getAdminPlaces,
)

const getEnglishName = (translations: { language_code: string; name: string }[]) => {
  return translations.find(item => item.language_code === 'en')?.name
    ?? translations[0]?.name
    ?? 'Untitled place'
}

const getAreaName = (place: NonNullable<typeof places.value>[number]) => {
  const translations = place.areas?.area_translations ?? []

  return translations.find(item => item.language_code === 'en')?.name
    ?? translations[0]?.name
    ?? '—'
}

const formatDate = (date?: string | null) => {
  if (!date) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

const placeTypes = computed(() => [
  ...new Set((places.value ?? []).map(place => place.place_type)),
].sort())

const filteredPlaces = computed(() => {
  const normalizedSearch = search.value.trim().toLowerCase()

  return (places.value ?? []).filter((place) => {
    const name = getEnglishName(place.place_translations).toLowerCase()
    const matchesSearch = !normalizedSearch
      || name.includes(normalizedSearch)
      || place.slug.toLowerCase().includes(normalizedSearch)
      || place.place_type.toLowerCase().includes(normalizedSearch)
    const matchesStatus = selectedStatus.value === 'all'
      || place.status === selectedStatus.value
    const matchesType = selectedType.value === 'all'
      || place.place_type === selectedType.value

    return matchesSearch && matchesStatus && matchesType
  })
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 lg:pl-60">
    <AdminSidebar :open="navigationOpen" @close="navigationOpen = false" />
    <AdminHeader title="Places" description="Manage destinations, restaurants and travel places." @menu="navigationOpen = true" />

    <main class="p-4 sm:p-6 lg:p-8">
      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_11rem]">
          <div><label for="place-search" class="sr-only">Search places</label><input id="place-search" v-model="search" type="search" placeholder="Search by name, slug or type" class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"></div>
          <div><label for="status-filter" class="sr-only">Filter by status</label><select id="status-filter" v-model="selectedStatus" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select></div>
          <div><label for="type-filter" class="sr-only">Filter by place type</label><select id="type-filter" v-model="selectedType" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="all">All place types</option><option v-for="placeType in placeTypes" :key="placeType" :value="placeType">{{ placeType }}</option></select></div>
        </div>
      </section>

      <p v-if="pending" class="mt-6 rounded-xl bg-white p-5 text-sm text-slate-500">Loading places…</p>
      <p v-else-if="error" class="mt-6 rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">Places are unavailable right now.</p>
      <p v-else-if="!places?.length" class="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">No places have been added yet.</p>
      <p v-else-if="!filteredPlaces.length" class="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">No places match the current filters.</p>

      <section v-else class="mt-6">
        <div class="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
          <table class="w-full text-left text-sm"><thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th class="px-5 py-3">Place</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Area</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Last Verified</th><th class="px-4 py-3">Updated</th><th class="px-5 py-3 text-right">Actions</th></tr></thead><tbody class="divide-y divide-slate-100"><tr v-for="place in filteredPlaces" :key="place.id" class="text-slate-600"><td class="px-5 py-4"><p class="font-medium text-slate-900">{{ getEnglishName(place.place_translations) }}</p><p class="mt-1 text-xs text-slate-400">{{ place.slug }}</p></td><td class="px-4 py-4 capitalize">{{ place.place_type }}</td><td class="px-4 py-4">{{ getAreaName(place) }}</td><td class="px-4 py-4"><AdminStatusBadge :status="place.status" /></td><td class="px-4 py-4 whitespace-nowrap">{{ formatDate(place.last_verified_at) }}</td><td class="px-4 py-4 whitespace-nowrap">{{ formatDate(place.updated_at) }}</td><td class="px-5 py-4 text-right"><NuxtLink :to="`/places/${place.slug}`" class="font-medium text-blue-600 hover:text-blue-700">View</NuxtLink></td></tr></tbody></table>
        </div>
        <div class="grid gap-3 lg:hidden"><article v-for="place in filteredPlaces" :key="place.id" class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div class="flex items-start justify-between gap-3"><div><h2 class="font-semibold text-slate-900">{{ getEnglishName(place.place_translations) }}</h2><p class="mt-1 text-xs text-slate-400">{{ place.slug }}</p></div><AdminStatusBadge :status="place.status" /></div><dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm"><div><dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Type</dt><dd class="mt-1 capitalize text-slate-700">{{ place.place_type }}</dd></div><div><dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Area</dt><dd class="mt-1 text-slate-700">{{ getAreaName(place) }}</dd></div><div><dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Last verified</dt><dd class="mt-1 text-slate-700">{{ formatDate(place.last_verified_at) }}</dd></div></dl><NuxtLink :to="`/places/${place.slug}`" class="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700">View place <span aria-hidden="true">→</span></NuxtLink></article></div>
      </section>
    </main>
  </div>
</template>
