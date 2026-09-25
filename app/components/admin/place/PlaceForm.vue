<script setup lang="ts">
import type { AdminPlaceFormValues } from '~/composables/useAdminPlaces'

type Area = {
  id: string
  slug: string
  area_translations: { language_code: string; name: string }[]
}

type Source = { id: string; name: string }

type Cover = {
  storage_path: string
  alt_text: string | null
  credit_text: string | null
} | null

const props = defineProps<{
  initialValues: AdminPlaceFormValues
  areas: Area[]
  sources: Source[]
  cover: Cover
  saving: boolean
  successMessage?: string
}>()

const emit = defineEmits<{
  save: [payload: { values: AdminPlaceFormValues; coverFile: File | null; viewAfterSave: boolean }]
}>()

const form = reactive<AdminPlaceFormValues>({ ...props.initialValues })
const coverFile = ref<File | null>(null)
const validationError = ref('')

const getAreaName = (area: Area) => {
  return area.area_translations.find(translation => translation.language_code === 'en')?.name
    ?? area.area_translations[0]?.name
    ?? area.slug
}

const submit = (viewAfterSave: boolean) => {
  validationError.value = ''

  if (!form.name.trim() || !form.placeType.trim() || !form.slug.trim()) {
    validationError.value = 'Name, slug, and place type are required.'
    return
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
    validationError.value = 'Use lowercase letters, numbers, and hyphens for the slug.'
    return
  }

  emit('save', {
    values: { ...form, slug: form.slug.trim().toLowerCase() },
    coverFile: coverFile.value,
    viewAfterSave,
  })
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit(false)">
    <p v-if="validationError" role="alert" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ validationError }}</p>
    <p v-if="successMessage" role="status" class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{{ successMessage }}</p>

    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 class="text-base font-semibold text-slate-900">Place details</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label for="place-name" class="block text-sm font-medium text-slate-800">English name <span class="text-red-600">*</span></label><input id="place-name" v-model="form.name" required type="text" maxlength="180" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"></div>
        <div><label for="place-slug" class="block text-sm font-medium text-slate-800">Slug <span class="text-red-600">*</span></label><input id="place-slug" v-model="form.slug" required type="text" pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="seoul-forest" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><p class="mt-1 text-xs text-slate-500">Lowercase letters, numbers, and hyphens only.</p></div>
        <div><label for="place-type" class="block text-sm font-medium text-slate-800">Place type <span class="text-red-600">*</span></label><input id="place-type" v-model="form.placeType" required type="text" placeholder="park, cafe, neighborhood" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"></div>
        <div><label for="place-status" class="block text-sm font-medium text-slate-800">Status</label><select id="place-status" v-model="form.status" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
        <div><label for="place-area" class="block text-sm font-medium text-slate-800">Area</label><select id="place-area" v-model="form.areaId" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">No area selected</option><option v-for="area in areas" :key="area.id" :value="area.id">{{ getAreaName(area) }}</option></select></div>
        <div><label for="place-source" class="block text-sm font-medium text-slate-800">Source</label><select id="place-source" v-model="form.sourceId" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">No source selected</option><option v-for="source in sources" :key="source.id" :value="source.id">{{ source.name }}</option></select></div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 class="text-base font-semibold text-slate-900">English content</h2>
      <div class="mt-4 space-y-4">
        <div><label for="place-summary" class="block text-sm font-medium text-slate-800">Summary</label><textarea id="place-summary" v-model="form.summary" rows="2" maxlength="500" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
        <div><label for="place-description" class="block text-sm font-medium text-slate-800">Description</label><textarea id="place-description" v-model="form.description" rows="5" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
        <div class="grid gap-4 sm:grid-cols-2"><div><label for="place-address" class="block text-sm font-medium text-slate-800">Address</label><textarea id="place-address" v-model="form.addressText" rows="3" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div><label for="place-tip" class="block text-sm font-medium text-slate-800">Local tip</label><textarea id="place-tip" v-model="form.localTip" rows="3" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></div>
      </div>
    </section>

    <AdminPlaceCoverImageField v-model:alt-text="form.coverAltText" v-model:credit-text="form.coverCreditText" :cover="cover" @update:file="coverFile = $event" />

    <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 class="text-base font-semibold text-slate-900">Contact and verification</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label for="place-phone" class="block text-sm font-medium text-slate-800">Phone</label><input id="place-phone" v-model="form.phone" type="tel" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"></div>
        <div><label for="place-verified" class="block text-sm font-medium text-slate-800">Last verified</label><input id="place-verified" v-model="form.lastVerifiedAt" type="date" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"></div>
        <div><label for="place-website" class="block text-sm font-medium text-slate-800">Website URL</label><input id="place-website" v-model="form.websiteUrl" type="url" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"></div>
        <div><label for="place-naver" class="block text-sm font-medium text-slate-800">Naver Map URL</label><input id="place-naver" v-model="form.naverMapUrl" type="url" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"></div>
        <div><label for="place-kakao" class="block text-sm font-medium text-slate-800">Kakao Map URL</label><input id="place-kakao" v-model="form.kakaoMapUrl" type="url" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"></div>
        <div><label for="place-foreigner-friendly" class="block text-sm font-medium text-slate-800">Foreigner friendly</label><select id="place-foreigner-friendly" v-model="form.foreignerFriendly" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">Not specified</option><option value="true">Yes</option><option value="false">No</option></select></div>
      </div>
      <div class="mt-4"><label for="place-hours" class="block text-sm font-medium text-slate-800">Opening hours (JSON)</label><textarea id="place-hours" v-model="form.openingHours" rows="4" placeholder='{"mon": "10:00–18:00"}' class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-900 outline-none placeholder:font-sans focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><p class="mt-1 text-xs text-slate-500">Leave blank when hours are unavailable.</p></div>
    </section>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
      <NuxtLink to="/admin/places" class="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">Cancel</NuxtLink>
      <div class="flex flex-wrap gap-3"><button type="submit" :disabled="saving" class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">{{ saving ? 'Saving…' : 'Save' }}</button><button type="button" :disabled="saving" class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" @click="submit(true)">{{ saving ? 'Saving…' : 'Save & view' }}</button></div>
    </div>
  </form>
</template>
