<script setup lang="ts">
import { Heart, Share2 } from 'lucide-vue-next'

type ContentType = 'place' | 'route' | 'guide'

const props = defineProps<{
  contentType: ContentType
  title: string
  text?: string | null
}>()

const feedback = ref('')
let feedbackTimeout: ReturnType<typeof setTimeout> | undefined

const contentNoun = computed(() => props.contentType)
const saveLabel = computed(() => `Save this ${contentNoun.value}`)
const shareLabel = computed(() => `Share this ${contentNoun.value}`)
const shareText = computed(() => props.text?.trim().slice(0, 180) || undefined)

const setFeedback = (message: string) => {
  feedback.value = message
  if (feedbackTimeout) clearTimeout(feedbackTimeout)
  feedbackTimeout = setTimeout(() => { feedback.value = '' }, 2400)
}

const copyCurrentUrl = async (url: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url)
    return
  }

  const input = document.createElement('textarea')
  input.value = url
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  const copied = document.execCommand('copy')
  input.remove()

  if (!copied) throw new Error('Copy command was unavailable')
}

const share = async () => {
  if (!import.meta.client) return

  const url = window.location.href
  const shareData = {
    title: props.title,
    ...(shareText.value ? { text: shareText.value } : {}),
    url,
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
      return
    }
    catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }

  try {
    await copyCurrentUrl(url)
    setFeedback('Link copied')
  }
  catch {
    setFeedback('Unable to copy link')
  }
}

onBeforeUnmount(() => {
  if (feedbackTimeout) clearTimeout(feedbackTimeout)
})
</script>

<template>
  <div class="relative inline-flex shrink-0 items-center gap-1">
    <button
      type="button"
      :aria-label="saveLabel"
      aria-disabled="true"
      :title="`${saveLabel} — coming soon`"
      class="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      @click.prevent
    >
      <Heart :size="19" aria-hidden="true" />
      <span class="sr-only">Coming soon</span>
    </button>
    <button
      type="button"
      :aria-label="shareLabel"
      :title="shareLabel"
      class="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      @click="share"
    >
      <Share2 :size="19" aria-hidden="true" />
    </button>
    <span v-if="feedback" role="status" class="absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm">{{ feedback }}</span>
  </div>
</template>
