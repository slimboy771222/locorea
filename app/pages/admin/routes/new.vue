<script setup lang="ts">
import type { AdminRouteFormValues } from '~/composables/useAdminRoutes'
definePageMeta({ middleware: 'admin-auth' })
const navigationOpen = ref(false)
const saving = ref(false)
const saveError = ref('')
const { getOptions, createAdminRoute } = useAdminRoutes()
const { data: options, error } = await useAsyncData('admin-route-options', getOptions)
const initialValues: AdminRouteFormValues = { slug: '', routeType: 'half_day', areaId: '', sourceId: '', sourceUrl: '', durationMinutes: '', distanceKm: '', difficulty: '', status: 'draft', lastVerifiedAt: '', name: '', summary: '', description: '', coverAltText: '', coverCreditText: '', stops: [] }
const save = async ({ values, coverFile, viewAfterSave }: { values: AdminRouteFormValues; coverFile: File | null; viewAfterSave: boolean }) => {
  saving.value = true; saveError.value = ''
  try {
    const result = await createAdminRoute(values, coverFile)
    if (result.partial) { await navigateTo({ path: `/admin/routes/${result.id}`, query: { notice: 'partial-save' } }); return }
    if (viewAfterSave && values.status === 'published') { await navigateTo(`/routes/${values.slug}`); return }
    await navigateTo(`/admin/routes/${result.id}`)
  }
  catch (failure: unknown) { saveError.value = getAdminRouteSaveError(failure, values.slug) }
  finally { saving.value = false }
}
</script>
<template><div class="min-h-screen bg-slate-50 lg:pl-60"><AdminSidebar :open="navigationOpen" @close="navigationOpen = false" /><AdminHeader title="Add route" description="Create a route as a draft, then publish it when it is ready." @menu="navigationOpen = true" /><main class="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8"><p v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Route options are unavailable right now.</p><template v-else-if="options"><p v-if="saveError" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ saveError }}</p><AdminRouteForm :initial-values="initialValues" :areas="options.areas" :sources="options.sources" :places="options.places" :cover="null" :saving="saving" @save="save" /></template></main></div></template>
