<script setup lang="ts">
import type { ReviewEntityType, ReviewItem, ReviewStatus } from '~/composables/useAdminReview'

definePageMeta({ middleware: 'admin-auth' })

const navigationOpen = ref(false)
const search = ref('')
const selectedStatus = ref<'pending' | 'all' | ReviewStatus>('pending')
const selectedType = ref<'all' | ReviewEntityType>('all')
const actionError = ref('')
const actionId = ref<string | null>(null)
const { getReviewQueue, updateReview } = useAdminReview()
const { data: queue, pending, error, refresh } = await useAsyncData('admin-review-queue', getReviewQueue)

const filteredItems = computed(() => (queue.value?.items ?? []).filter((item) => {
  const keyword = search.value.trim().toLowerCase()
  const matchesSearch = !keyword || item.title.toLowerCase().includes(keyword) || item.slug.includes(keyword)
  const matchesStatus = selectedStatus.value === 'all' || (selectedStatus.value === 'pending' ? item.reviewStatus !== 'approved' : item.reviewStatus === selectedStatus.value)
  return matchesSearch && matchesStatus && (selectedType.value === 'all' || item.type === selectedType.value)
}))

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : '—'
const entityLabel = (type: ReviewEntityType) => type.charAt(0).toUpperCase() + type.slice(1)
const editPath = (item: ReviewItem) => `/admin/${item.type === 'place' ? 'places' : item.type === 'route' ? 'routes' : 'guides'}/${item.id}`

const setReview = async (item: ReviewItem, reviewStatus: ReviewStatus) => {
  actionId.value = item.id
  actionError.value = ''
  try {
    await updateReview({ type: item.type, id: item.id, reviewStatus, reviewNote: item.reviewNote ?? '' })
    await refresh()
  }
  catch (failure: unknown) {
    actionError.value = failure instanceof Error ? failure.message : 'The review status could not be updated.'
  }
  finally {
    actionId.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 lg:pl-60">
    <AdminSidebar :open="navigationOpen" @close="navigationOpen = false" />
    <AdminHeader title="Content Review" description="Review imported and manually authored content before release." @menu="navigationOpen = true" />
    <main class="p-4 sm:p-6 lg:p-8">
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-xl border border-amber-100 bg-amber-50/60 p-4"><p class="text-xs font-semibold uppercase tracking-wide text-amber-700">Needs Review</p><p class="mt-2 text-2xl font-bold text-slate-900">{{ queue?.counts.unreviewed ?? 0 }}</p></article>
        <article class="rounded-xl border border-blue-100 bg-blue-50/60 p-4"><p class="text-xs font-semibold uppercase tracking-wide text-blue-700">In Review</p><p class="mt-2 text-2xl font-bold text-slate-900">{{ queue?.counts.in_review ?? 0 }}</p></article>
        <article class="rounded-xl border border-rose-100 bg-rose-50/60 p-4"><p class="text-xs font-semibold uppercase tracking-wide text-rose-700">Needs Fix</p><p class="mt-2 text-2xl font-bold text-slate-900">{{ queue?.counts.needs_fix ?? 0 }}</p></article>
        <article class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"><p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">Approved</p><p class="mt-2 text-2xl font-bold text-slate-900">{{ queue?.counts.approved ?? 0 }}</p></article>
      </section>

      <section class="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_11rem]"><input v-model="search" type="search" placeholder="Search by name or slug" class="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><select v-model="selectedStatus" class="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="pending">Review queue (not approved)</option><option value="all">All review statuses</option><option value="unreviewed">Unreviewed</option><option value="in_review">In Review</option><option value="needs_fix">Needs Fix</option><option value="approved">Approved</option></select><select v-model="selectedType" class="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="all">All content types</option><option value="place">Places</option><option value="route">Routes</option><option value="guide">Guides</option></select></div>
      </section>

      <p v-if="actionError" role="alert" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{{ actionError }}</p>
      <p v-if="pending" class="mt-6 rounded-xl bg-white p-5 text-sm text-slate-500">Loading review queue…</p><p v-else-if="error" class="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">The review queue is unavailable right now.</p><p v-else-if="!filteredItems.length" class="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">No content matches the current review filters.</p>
      <section v-else class="mt-6">
        <div class="hidden overflow-hidden rounded-xl border border-slate-200 bg-white lg:block"><table class="w-full text-left text-sm"><thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th class="px-5 py-3">Content</th><th class="px-4 py-3">Public</th><th class="px-4 py-3">Review</th><th class="px-4 py-3">Source</th><th class="px-4 py-3">Last verified</th><th class="px-4 py-3">Updated</th><th class="px-5 py-3 text-right">Actions</th></tr></thead><tbody class="divide-y divide-slate-100"><tr v-for="item in filteredItems" :key="item.id"><td class="px-5 py-4"><div class="flex items-center gap-2"><p class="font-medium text-slate-900">{{ item.title }}</p><span v-if="item.hasCover" class="text-xs text-slate-400">Cover</span></div><p class="mt-1 text-xs text-slate-400">{{ entityLabel(item.type) }} · {{ item.slug }}</p><p v-if="item.reviewNote" class="mt-1 max-w-sm truncate text-xs text-slate-500">{{ item.reviewNote }}</p></td><td class="px-4 py-4"><AdminStatusBadge :status="item.status" /></td><td class="px-4 py-4"><AdminReviewStatusBadge :status="item.reviewStatus" /></td><td class="px-4 py-4 text-slate-600">{{ item.source ?? '—' }}</td><td class="px-4 py-4 whitespace-nowrap text-slate-600">{{ formatDate(item.lastVerifiedAt) }}</td><td class="px-4 py-4 whitespace-nowrap text-slate-600">{{ formatDate(item.updatedAt) }}</td><td class="px-5 py-4 text-right"><div class="flex justify-end gap-2"><button v-if="item.reviewStatus !== 'in_review'" type="button" :disabled="actionId === item.id" class="text-sm font-medium text-blue-700 disabled:opacity-50" @click="setReview(item, 'in_review')">Start</button><button v-if="item.reviewStatus !== 'needs_fix'" type="button" :disabled="actionId === item.id" class="text-sm font-medium text-rose-700 disabled:opacity-50" title="Add a review note in the editor" @click="setReview(item, 'needs_fix')">Needs Fix</button><button v-if="item.reviewStatus !== 'approved'" type="button" :disabled="actionId === item.id" class="text-sm font-medium text-emerald-700 disabled:opacity-50" @click="setReview(item, 'approved')">Approve</button><NuxtLink :to="editPath(item)" class="text-sm font-medium text-slate-700">Edit</NuxtLink></div></td></tr></tbody></table></div>
        <div class="grid gap-3 lg:hidden"><article v-for="item in filteredItems" :key="item.id" class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div class="flex items-start justify-between gap-3"><div><p class="font-semibold text-slate-900">{{ item.title }}</p><p class="mt-1 text-xs text-slate-400">{{ entityLabel(item.type) }} · {{ item.slug }}</p></div><AdminReviewStatusBadge :status="item.reviewStatus" /></div><div class="mt-3 flex flex-wrap gap-2"><AdminStatusBadge :status="item.status" /><span v-if="item.hasCover" class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">Cover</span></div><p class="mt-3 text-sm text-slate-600">{{ item.source ?? 'No source' }} · Updated {{ formatDate(item.updatedAt) }}</p><p v-if="item.reviewNote" class="mt-2 text-sm text-slate-500">{{ item.reviewNote }}</p><div class="mt-4 flex flex-wrap gap-3 text-sm font-medium"><button v-if="item.reviewStatus !== 'in_review'" type="button" :disabled="actionId === item.id" class="text-blue-700 disabled:opacity-50" @click="setReview(item, 'in_review')">Start Review</button><button v-if="item.reviewStatus !== 'needs_fix'" type="button" :disabled="actionId === item.id" class="text-rose-700 disabled:opacity-50" @click="setReview(item, 'needs_fix')">Needs Fix</button><button v-if="item.reviewStatus !== 'approved'" type="button" :disabled="actionId === item.id" class="text-emerald-700 disabled:opacity-50" @click="setReview(item, 'approved')">Approve</button><NuxtLink :to="editPath(item)" class="text-slate-700">Edit</NuxtLink></div></article></div>
      </section>
    </main>
  </div>
</template>
