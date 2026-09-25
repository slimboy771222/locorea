<script setup lang="ts">
import type { AdminPlaceFormValues } from '~/composables/useAdminPlaces'

definePageMeta({ middleware: 'admin-auth' })

const navigationOpen = ref(false)
const saving = ref(false)
const saveError = ref('')
const { getAdminPlaceOptions, createAdminPlace } = useAdminPlaces()

const { data: options, error } = await useAsyncData('admin-place-options', getAdminPlaceOptions)

const initialValues: AdminPlaceFormValues = {
  slug: '',
  placeType: '',
  areaId: '',
  sourceId: '',
  status: 'draft',
  phone: '',
  websiteUrl: '',
  naverMapUrl: '',
  kakaoMapUrl: '',
  openingHours: '',
  foreignerFriendly: '',
  lastVerifiedAt: '',
  name: '',
  summary: '',
  description: '',
  addressText: '',
  localTip: '',
  coverAltText: '',
  coverCreditText: '',
}

const save = async ({ values, coverFile, viewAfterSave }: { values: AdminPlaceFormValues; coverFile: File | null; viewAfterSave: boolean }) => {
  saving.value = true
  saveError.value = ''

  try {
    const result = await createAdminPlace(values, coverFile)

    if (result.coverUploadFailed) {
      await navigateTo({
        path: `/admin/places/${result.id}`,
        query: { notice: 'cover-upload-failed' },
      })
      return
    }

    if (viewAfterSave && values.status === 'published') {
      await navigateTo(`/places/${values.slug}`)
      return
    }

    await navigateTo(`/admin/places/${result.id}`)
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
    <AdminHeader title="Add place" description="Create a new place as a draft or publish it when it is ready." @menu="navigationOpen = true" />

    <main class="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <p v-if="error" role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Place options are unavailable right now. Refresh the page and try again.</p>
      <template v-else-if="options">
        <p v-if="saveError" role="alert" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ saveError }}</p>
        <AdminPlaceForm :initial-values="initialValues" :areas="options.areas" :sources="options.sources" :cover="null" :saving="saving" @save="save" />
      </template>
    </main>
  </div>
</template>
