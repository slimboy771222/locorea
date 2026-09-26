<script setup lang="ts">
import type { AdminPlaceFormValues } from '~/composables/useAdminPlaces'

definePageMeta({ middleware: 'admin-auth' })

const route = useRoute()
const navigationOpen = ref(false)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(useRoute().query.notice === 'cover-upload-failed'
  ? 'Place saved successfully, but the cover image could not be uploaded. You can try uploading the cover again from this edit page.'
  : '')
const id = computed(() => String(route.params.id))
const { getAdminPlaceById, getAdminPlaceOptions, updateAdminPlace } = useAdminPlaces()

const { data: place, error: placeError, refresh } = await useAsyncData(
  () => `admin-place-${id.value}`,
  () => getAdminPlaceById(id.value),
)
const { data: options, error: optionsError } = await useAsyncData('admin-place-options', getAdminPlaceOptions)

if (!place.value && !placeError.value) {
  throw createError({ statusCode: 404, statusMessage: 'Place not found' })
}

const formValues = computed<AdminPlaceFormValues | null>(() => {
  if (!place.value) {
    return null
  }

  const translation = place.value.place_translations.find(item => item.language_code === 'en')

  return {
    slug: place.value.slug,
    placeType: place.value.place_type,
    areaId: place.value.area_id ?? '',
    sourceId: place.value.source_id ?? '',
    sourceUrl: place.value.source_url ?? '',
    status: place.value.status as AdminPlaceFormValues['status'],
    phone: place.value.phone ?? '',
    websiteUrl: place.value.website_url ?? '',
    naverMapUrl: place.value.naver_map_url ?? '',
    kakaoMapUrl: place.value.kakao_map_url ?? '',
    openingHours: place.value.opening_hours ? JSON.stringify(place.value.opening_hours, null, 2) : '',
    foreignerFriendly: place.value.foreigner_friendly === null ? '' : String(place.value.foreigner_friendly) as 'true' | 'false',
    lastVerifiedAt: place.value.last_verified_at?.slice(0, 10) ?? '',
    name: translation?.name ?? '',
    summary: translation?.summary ?? '',
    description: translation?.description ?? '',
    addressText: translation?.address_text ?? '',
    localTip: translation?.local_tip ?? '',
    coverAltText: place.value.cover?.alt_text ?? '',
    coverCreditText: place.value.cover?.credit_text ?? '',
  }
})

const save = async ({ values, coverFile, viewAfterSave }: { values: AdminPlaceFormValues; coverFile: File | null; viewAfterSave: boolean }) => {
  if (!place.value) {
    return
  }

  saving.value = true
  saveError.value = ''
  saveSuccess.value = ''

  try {
    await updateAdminPlace(id.value, values, coverFile, place.value.cover)

    if (viewAfterSave && values.status === 'published') {
      await navigateTo(`/places/${values.slug}`)
      return
    }

    await refresh()
    saveSuccess.value = viewAfterSave
      ? 'Place saved as a non-published record. Publish it to preview the public page.'
      : 'Place saved successfully.'
  }
  catch (saveFailure: unknown) {
    saveError.value = getAdminPlaceSaveError(saveFailure, values.slug)
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 lg:pl-60">
    <AdminSidebar :open="navigationOpen" @close="navigationOpen = false" />
    <AdminHeader title="Edit place" description="Update place information, English content, and the cover image." @menu="navigationOpen = true" />

    <main class="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <p v-if="placeError || optionsError" role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">This place is unavailable right now. Refresh the page and try again.</p>
      <template v-else-if="formValues && options && place">
        <p v-if="saveError" role="alert" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ saveError }}</p>
        <AdminContentReviewPanel :key="`review-${place.id}-${place.updated_at}`" class="mb-6" entity-type="place" :entity-id="place.id" :review-status="place.review_status" :reviewed-at="place.reviewed_at" :review-note="place.review_note" @saved="refresh" />
        <AdminPlaceForm :key="place.id + place.updated_at" :initial-values="formValues" :areas="options.areas" :sources="options.sources" :cover="place.cover" :saving="saving" :success-message="saveSuccess" @save="save" />
      </template>
    </main>
  </div>
</template>
