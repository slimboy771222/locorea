<script setup lang="ts">
import type { AdminRouteFormValues, AdminRouteStop } from '~/composables/useAdminRoutes'

type Area = { id: string; slug: string; area_translations: { language_code: string; name: string }[] }
type Source = { id: string; name: string }
type Place = { id: string; slug: string; place_translations: { language_code: string; name: string }[] }
type Cover = { storage_path: string; alt_text: string | null; credit_text: string | null } | null

const props = defineProps<{ initialValues: AdminRouteFormValues; areas: Area[]; sources: Source[]; places: Place[]; cover: Cover; saving: boolean; successMessage?: string }>()
const emit = defineEmits<{ save: [payload: { values: AdminRouteFormValues; coverFile: File | null; viewAfterSave: boolean }] }>()
const form = reactive<AdminRouteFormValues>({ ...props.initialValues, stops: props.initialValues.stops.map(stop => ({ ...stop })) })
const coverFile = ref<File | null>(null)
const placeToAdd = ref('')
const validationError = ref('')
const english = (items: { language_code: string; name: string }[], fallback: string) => items.find(item => item.language_code === 'en')?.name ?? items[0]?.name ?? fallback
const addStop = () => {
  if (!placeToAdd.value || form.stops.some(stop => stop.placeId === placeToAdd.value)) return
  form.stops.push({ placeId: placeToAdd.value, stayMinutes: '', travelMinutesToNext: '', note: '' })
  placeToAdd.value = ''
}
const moveStop = (index: number, direction: -1 | 1) => {
  const target = index + direction
  if (target < 0 || target >= form.stops.length) return
  const stop = form.stops.splice(index, 1)[0]
  if (!stop) return
  form.stops.splice(target, 0, stop)
}
const submit = (viewAfterSave: boolean) => {
  validationError.value = ''
  if (!form.name.trim() || !form.slug.trim()) { validationError.value = 'English name and slug are required.'; return }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) { validationError.value = 'Use lowercase letters, numbers, and hyphens for the slug.'; return }
  if (form.stops.some(stop => !stop.placeId)) { validationError.value = 'Every stop must have a place.'; return }
  emit('save', { values: { ...form, slug: form.slug.trim().toLowerCase(), stops: form.stops.map(stop => ({ ...stop })) }, coverFile: coverFile.value, viewAfterSave })
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit(false)">
    <p v-if="validationError" role="alert" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ validationError }}</p>
    <p v-if="successMessage" role="status" class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{{ successMessage }}</p>
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 class="text-base font-semibold text-slate-900">Basic information</h2><div class="mt-4 grid gap-4 sm:grid-cols-2">
      <div><label for="route-name" class="block text-sm font-medium text-slate-800">English name *</label><input id="route-name" v-model="form.name" required class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"></div>
      <div><label for="route-slug" class="block text-sm font-medium text-slate-800">Slug *</label><input id="route-slug" v-model="form.slug" required placeholder="seoul-day-walk" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><p class="mt-1 text-xs text-slate-500">Lowercase letters, numbers, and hyphens only.</p></div>
      <div><label for="route-type" class="block text-sm font-medium text-slate-800">Route type</label><select id="route-type" v-model="form.routeType" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="walking">Walking</option><option value="half_day">Half day</option><option value="one_day">One day</option><option value="multi_day">Multi day</option><option value="food">Food</option><option value="shopping">Shopping</option><option value="culture">Culture</option><option value="custom">Custom</option></select></div>
      <div><label for="route-area" class="block text-sm font-medium text-slate-800">Area</label><select id="route-area" v-model="form.areaId" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">No area selected</option><option v-for="area in areas" :key="area.id" :value="area.id">{{ english(area.area_translations, area.slug) }}</option></select></div>
      <div><label for="route-duration" class="block text-sm font-medium text-slate-800">Duration (minutes)</label><input id="route-duration" v-model="form.durationMinutes" min="0" type="number" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"></div>
      <div><label for="route-distance" class="block text-sm font-medium text-slate-800">Distance (km)</label><input id="route-distance" v-model="form.distanceKm" min="0" step="0.01" type="number" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"></div>
      <div><label for="route-difficulty" class="block text-sm font-medium text-slate-800">Difficulty</label><select id="route-difficulty" v-model="form.difficulty" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Not specified</option><option value="easy">Easy</option><option value="normal">Normal</option><option value="hard">Hard</option></select></div>
      <div><label for="route-source" class="block text-sm font-medium text-slate-800">Source</label><select id="route-source" v-model="form.sourceId" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">No source selected</option><option v-for="source in sources" :key="source.id" :value="source.id">{{ source.name }}</option></select></div>
    </div></section>
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 class="text-base font-semibold text-slate-900">English content</h2><div class="mt-4 space-y-4"><div><label for="route-summary" class="block text-sm font-medium text-slate-800">Summary</label><textarea id="route-summary" v-model="form.summary" rows="2" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div><div><label for="route-description" class="block text-sm font-medium text-slate-800">Description</label><textarea id="route-description" v-model="form.description" rows="5" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></div></div></section>
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 class="text-base font-semibold text-slate-900">Route stops</h2><div class="mt-4 flex flex-col gap-3 sm:flex-row"><select v-model="placeToAdd" class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Select an existing place</option><option v-for="place in places" :key="place.id" :value="place.id" :disabled="form.stops.some(stop => stop.placeId === place.id)">{{ english(place.place_translations, place.slug) }}</option></select><button type="button" class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700" @click="addStop">Add stop</button></div><p v-if="!form.stops.length" class="mt-4 text-sm text-slate-500">No stops added yet.</p><ol v-else class="mt-4 space-y-3"> <li v-for="(stop, index) in form.stops" :key="stop.placeId" class="rounded-lg border border-slate-200 p-3"><div class="flex flex-wrap items-center justify-between gap-3"><p class="font-medium text-slate-900"><span class="mr-2 text-slate-400">{{ index + 1 }}.</span>{{ english(places.find(place => place.id === stop.placeId)?.place_translations ?? [], 'Unknown place') }}</p><div class="flex gap-2"><button type="button" :disabled="index === 0" class="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40" @click="moveStop(index, -1)">Move up</button><button type="button" :disabled="index === form.stops.length - 1" class="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40" @click="moveStop(index, 1)">Move down</button><button type="button" class="rounded border border-red-200 px-2 py-1 text-xs text-red-700" @click="form.stops.splice(index, 1)">Remove</button></div></div><div class="mt-3 grid gap-3 sm:grid-cols-3"><input v-model="stop.stayMinutes" min="0" type="number" placeholder="Stay minutes" class="rounded border border-slate-300 px-3 py-2 text-sm"><input v-model="stop.travelMinutesToNext" min="0" type="number" placeholder="Travel to next" class="rounded border border-slate-300 px-3 py-2 text-sm"><input v-model="stop.note" placeholder="Stop note" class="rounded border border-slate-300 px-3 py-2 text-sm"></div></li></ol></section>
    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 class="text-base font-semibold text-slate-900">Publishing</h2><div class="mt-4 grid gap-4 sm:grid-cols-2"><div><label for="route-status" class="block text-sm font-medium text-slate-800">Status</label><select id="route-status" v-model="form.status" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div><div><label for="route-verified" class="block text-sm font-medium text-slate-800">Last verified</label><input id="route-verified" v-model="form.lastVerifiedAt" type="date" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"></div></div></section>
    <AdminPlaceCoverImageField v-model:alt-text="form.coverAltText" v-model:credit-text="form.coverCreditText" :cover="cover" @update:file="coverFile = $event" />
    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5"><NuxtLink to="/admin/routes" class="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</NuxtLink><div class="flex gap-3"><button type="submit" :disabled="saving" class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60">{{ saving ? 'Saving…' : 'Save' }}</button><button type="button" :disabled="saving" class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" @click="submit(true)">{{ saving ? 'Saving…' : 'Save & view' }}</button></div></div>
  </form>
</template>
