<script setup lang="ts">
type Cover = {
  storage_path: string
  alt_text: string | null
  credit_text: string | null
} | null

const props = defineProps<{
  cover: Cover
  altText: string
  creditText: string
}>()

const emit = defineEmits<{
  'update:altText': [value: string]
  'update:creditText': [value: string]
  'update:file': [file: File | null]
}>()

const { getPublicMediaUrl } = useMedia()
const selectedFile = ref<File | null>(null)
const objectUrl = ref<string | null>(null)

const previewUrl = computed(() => objectUrl.value ?? (props.cover
  ? getPublicMediaUrl(props.cover.storage_path)
  : null))

const previewAlt = computed(() => props.altText || props.cover?.alt_text || 'Place cover preview')

const selectFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null

  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
  }

  selectedFile.value = file
  objectUrl.value = file ? URL.createObjectURL(file) : null
  emit('update:file', file)
}

onBeforeUnmount(() => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
  }
})
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <div>
        <h2 class="text-base font-semibold text-slate-900">Cover image</h2>
        <p class="mt-1 text-sm text-slate-600">JPEG, PNG, or WebP. A new image replaces the current cover after it uploads successfully.</p>
      </div>
      <span v-if="selectedFile" class="text-xs font-medium text-emerald-700">New image selected</span>
    </div>

    <div class="mt-4 grid gap-4 md:grid-cols-[13rem_minmax(0,1fr)]">
      <div class="aspect-[4/3] overflow-hidden rounded-lg bg-slate-200">
        <img v-if="previewUrl" :src="previewUrl" :alt="previewAlt" class="h-full w-full object-cover">
        <div v-else class="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">No cover image yet</div>
      </div>

      <div class="space-y-4">
        <div>
          <label for="cover-file" class="block text-sm font-medium text-slate-800">Upload cover</label>
          <input id="cover-file" accept="image/jpeg,image/png,image/webp" type="file" class="mt-1.5 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 file:shadow-sm file:ring-1 file:ring-inset file:ring-slate-300 hover:file:bg-slate-50" @change="selectFile">
        </div>
        <div>
          <label for="cover-alt" class="block text-sm font-medium text-slate-800">Image alt text</label>
          <input id="cover-alt" :value="altText" type="text" maxlength="180" placeholder="Describe the photo for screen readers" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" @input="emit('update:altText', ($event.target as HTMLInputElement).value)">
        </div>
        <div>
          <label for="cover-credit" class="block text-sm font-medium text-slate-800">Photo credit</label>
          <input id="cover-credit" :value="creditText" type="text" maxlength="180" placeholder="Optional photographer or source credit" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" @input="emit('update:creditText', ($event.target as HTMLInputElement).value)">
        </div>
      </div>
    </div>
  </section>
</template>
