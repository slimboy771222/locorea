<script setup lang="ts">
import type { AdminRouteFormValues } from '~/composables/useAdminRoutes'
definePageMeta({ middleware: 'admin-auth' })
const route = useRoute(); const navigationOpen = ref(false); const saving = ref(false); const saveError = ref('')
const saveSuccess = ref(route.query.notice === 'partial-save' ? 'Route saved successfully, but some additional data could not be saved. You can continue editing this Route.' : '')
const id = computed(() => String(route.params.id)); const { getAdminRouteById, getOptions, updateAdminRoute } = useAdminRoutes()
const { data: routeData, error: routeError, refresh } = await useAsyncData(() => `admin-route-${id.value}`, () => getAdminRouteById(id.value))
const { data: options, error: optionsError } = await useAsyncData('admin-route-options', getOptions)
if (!routeData.value && !routeError.value) throw createError({ statusCode: 404, statusMessage: 'Route not found' })
const values = computed<AdminRouteFormValues | null>(() => {
  if (!routeData.value) return null
  const content = routeData.value.route_translations.find(item => item.language_code === 'en')
  return { slug: routeData.value.slug, routeType: routeData.value.route_type as AdminRouteFormValues['routeType'], areaId: routeData.value.area_id ?? '', sourceId: routeData.value.source_id ?? '', durationMinutes: routeData.value.duration_minutes?.toString() ?? '', distanceKm: routeData.value.distance_km?.toString() ?? '', difficulty: (routeData.value.difficulty ?? '') as AdminRouteFormValues['difficulty'], status: routeData.value.status as AdminRouteFormValues['status'], lastVerifiedAt: routeData.value.last_verified_at?.slice(0, 10) ?? '', name: content?.name ?? '', summary: content?.summary ?? '', description: content?.description ?? '', coverAltText: routeData.value.cover?.alt_text ?? '', coverCreditText: routeData.value.cover?.credit_text ?? '', stops: routeData.value.route_places.map(stop => ({ placeId: stop.place_id, stayMinutes: stop.stay_minutes?.toString() ?? '', travelMinutesToNext: stop.travel_minutes_to_next?.toString() ?? '', note: stop.note ?? '' })) }
})
const save = async ({ values: form, coverFile, viewAfterSave }: { values: AdminRouteFormValues; coverFile: File | null; viewAfterSave: boolean }) => {
  if (!routeData.value) return
  saving.value = true; saveError.value = ''; saveSuccess.value = ''
  try { await updateAdminRoute(id.value, form, coverFile, routeData.value.cover); if (viewAfterSave && form.status === 'published') { await navigateTo(`/routes/${form.slug}`); return }; await refresh(); saveSuccess.value = viewAfterSave ? 'Route saved as a non-published record. Publish it to preview the public page.' : 'Route saved successfully.' }
  catch (failure: unknown) { saveError.value = getAdminRouteSaveError(failure, form.slug) }
  finally { saving.value = false }
}
</script>
<template><div class="min-h-screen bg-slate-50 lg:pl-60"><AdminSidebar :open="navigationOpen" @close="navigationOpen = false" /><AdminHeader title="Edit route" description="Update route content, stops, publishing, and cover image." @menu="navigationOpen = true" /><main class="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8"><p v-if="routeError || optionsError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">This route is unavailable right now.</p><template v-else-if="values && options && routeData"><p v-if="saveError" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ saveError }}</p><AdminRouteForm :key="routeData.id + routeData.updated_at" :initial-values="values" :areas="options.areas" :sources="options.sources" :places="options.places" :cover="routeData.cover" :saving="saving" :success-message="saveSuccess" @save="save" /></template></main></div></template>
