<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next'

type GalleryImage = {
  src: string
  alt: string
  sourceProvider?: string | null
  sourceUrl?: string | null
  licenseCode?: string | null
  attributionText?: string | null
  attributionRequired?: boolean | null
}

const props = defineProps<{
  images: GalleryImage[]
}>()

const activeIndex = ref(0)
const pointerStart = ref<{ x: number, y: number } | null>(null)

const hasMultipleImages = computed(() => props.images.length > 1)
const activeImage = computed(() => props.images[activeIndex.value] ?? props.images[0])
const activeAttribution = computed(() => {
  const image = activeImage.value
  if (!image?.attributionRequired) return null

  const text = image.attributionText?.trim() || image.sourceProvider?.trim()
  if (!text) return null

  return {
    text,
    sourceUrl: image.sourceUrl?.trim() || null,
  }
})

const showPhoto = (index: number) => {
  if (!props.images.length) return
  activeIndex.value = (index + props.images.length) % props.images.length
}

const onPointerDown = (event: PointerEvent) => {
  if (!hasMultipleImages.value) return
  pointerStart.value = { x: event.clientX, y: event.clientY }
}

const onPointerUp = (event: PointerEvent) => {
  if (!pointerStart.value) return

  const horizontalDistance = event.clientX - pointerStart.value.x
  const verticalDistance = event.clientY - pointerStart.value.y
  pointerStart.value = null

  if (Math.abs(horizontalDistance) < 48 || Math.abs(horizontalDistance) <= Math.abs(verticalDistance)) return
  showPhoto(activeIndex.value + (horizontalDistance > 0 ? -1 : 1))
}
</script>

<template>
  <div class="min-w-0">
    <div
      class="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="pointerStart = null"
    >
      <img
        v-if="activeImage"
        :key="activeImage.src"
        :src="activeImage.src"
        :alt="activeImage.alt"
        class="h-full w-full object-cover"
        :loading="activeIndex === 0 ? 'eager' : 'lazy'"
        :fetchpriority="activeIndex === 0 ? 'high' : 'auto'"
        decoding="async"
      >

      <component
        :is="activeAttribution.sourceUrl ? 'a' : 'p'"
        v-if="activeAttribution"
        :href="activeAttribution.sourceUrl || undefined"
        :aria-label="activeAttribution.sourceUrl ? `View image source: ${activeAttribution.text}` : undefined"
        :target="activeAttribution.sourceUrl ? '_blank' : undefined"
        :rel="activeAttribution.sourceUrl ? 'noopener noreferrer' : undefined"
        class="absolute bottom-3 right-3 inline-flex max-w-[calc(100%-1.5rem)] items-start gap-1 rounded-md bg-slate-950/60 px-2 py-1 text-[11px] leading-4 text-white/95 backdrop-blur-sm sm:max-w-[70%]"
        :class="activeAttribution.sourceUrl ? 'transition hover:bg-slate-950/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white' : undefined"
      >
        <span class="line-clamp-2">{{ activeAttribution.text }}</span>
        <ExternalLink v-if="activeAttribution.sourceUrl" :size="12" class="mt-0.5 shrink-0" aria-hidden="true" />
      </component>
    </div>

    <div v-if="hasMultipleImages" class="mt-4 flex items-center justify-center gap-2.5" aria-label="Photo navigation">
      <button
        v-for="(_, index) in images"
        :key="index"
        type="button"
        :aria-label="`Show photo ${index + 1} of ${images.length}`"
        :aria-current="index === activeIndex ? 'true' : undefined"
        class="inline-flex size-8 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        @click="showPhoto(index)"
      >
        <span class="rounded-full transition-colors" :class="index === activeIndex ? 'size-3 bg-blue-700' : 'size-2.5 bg-slate-300'" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
