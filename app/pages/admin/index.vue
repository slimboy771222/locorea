<script setup lang="ts">
definePageMeta({
  middleware: 'admin-auth',
})

const navigationOpen = ref(false)
const { getAdminDashboard } = useAdminPlaces()

const { data: dashboard, pending, error } = await useAsyncData(
  'admin-dashboard',
  getAdminDashboard,
)

const getEnglishName = (translations: { language_code: string; name: string }[]) => {
  return translations.find(item => item.language_code === 'en')?.name
    ?? translations[0]?.name
    ?? 'Untitled place'
}

const formatDate = (date: string) => new Intl.DateTimeFormat(
  'en-US',
  { month: 'short', day: 'numeric', year: 'numeric' },
).format(new Date(date))

const summaryCards = computed(() => [
  { label: 'Total Places', value: dashboard.value?.placesByStatus.total ?? 0 },
  { label: 'Published', value: dashboard.value?.placesByStatus.published ?? 0 },
  { label: 'Draft', value: dashboard.value?.placesByStatus.draft ?? 0 },
  { label: 'Archived', value: dashboard.value?.placesByStatus.archived ?? 0 },
])
</script>

<template>
  <div class="min-h-screen bg-slate-50 lg:pl-60">
    <AdminSidebar :open="navigationOpen" @close="navigationOpen = false" />
    <AdminHeader title="Dashboard" description="Manage Locorea travel content and data." @menu="navigationOpen = true" />

    <main class="p-4 sm:p-6 lg:p-8">
      <div v-if="pending" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div v-for="index in 4" :key="index" class="h-28 animate-pulse rounded-xl bg-white" /></div>
      <p v-else-if="error" class="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">Dashboard data is unavailable right now.</p>
      <template v-else>
        <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Place summary">
          <div v-for="card in summaryCards" :key="card.label" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p class="text-sm font-medium text-slate-500">{{ card.label }}</p><p class="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{{ card.value }}</p></div>
        </section>

        <section class="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 class="font-semibold text-slate-950">Recent Places</h2><p class="mt-1 text-sm text-slate-500">Most recently updated place records.</p></div><NuxtLink to="/admin/places" class="text-sm font-medium text-blue-600 hover:text-blue-700">View all</NuxtLink></div>
          <p v-if="!dashboard?.recentPlaces.length" class="p-5 text-sm text-slate-500">No places yet.</p>
          <ul v-else class="divide-y divide-slate-100">
            <li v-for="place in dashboard.recentPlaces" :key="place.id" class="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><NuxtLink :to="`/places/${place.slug}`" class="font-medium text-slate-900 hover:text-blue-600">{{ getEnglishName(place.place_translations) }}</NuxtLink><p class="mt-1 text-sm text-slate-500"><span class="capitalize">{{ place.place_type }}</span> · Updated {{ formatDate(place.updated_at) }}</p></div><AdminStatusBadge :status="place.status" /></li>
          </ul>
        </section>
      </template>
    </main>
  </div>
</template>
