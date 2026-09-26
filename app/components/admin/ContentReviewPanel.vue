<script setup lang="ts">
import type { ReviewEntityType, ReviewStatus } from '~/composables/useAdminReview'

const props = defineProps<{
  entityType: ReviewEntityType
  entityId: string
  reviewStatus: string
  reviewedAt: string | null
  reviewNote: string | null
}>()

const emit = defineEmits<{ saved: [] }>()
const { updateReview } = useAdminReview()
const note = ref(props.reviewNote ?? '')
const saving = ref(false)
const error = ref('')
const success = ref('')
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not reviewed yet'

const save = async (reviewStatus: ReviewStatus) => {
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    await updateReview({ type: props.entityType, id: props.entityId, reviewStatus, reviewNote: note.value })
    success.value = reviewStatus === 'approved' ? 'Content approved for release.' : reviewStatus === 'needs_fix' ? 'Marked as needing fixes.' : 'Review status saved.'
    emit('saved')
  }
  catch (failure: unknown) {
    error.value = failure instanceof Error ? failure.message : 'The review status could not be saved.'
  }
  finally {
    saving.value = false
  }
}

const saveNote = async () => {
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    await updateReview({ type: props.entityType, id: props.entityId, reviewStatus: props.reviewStatus as ReviewStatus, reviewNote: note.value, preserveReviewMetadata: true })
    success.value = 'Review note saved.'
    emit('saved')
  }
  catch (failure: unknown) {
    error.value = failure instanceof Error ? failure.message : 'The review note could not be saved.'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="rounded-xl border border-blue-100 bg-blue-50/45 p-4 shadow-sm sm:p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div><h2 class="text-base font-semibold text-slate-900">Content Review</h2><p class="mt-1 text-sm text-slate-600">Approval is separate from public publishing.</p></div>
      <AdminReviewStatusBadge :status="reviewStatus" />
    </div>
    <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Review status</dt><dd class="mt-1 text-slate-700">{{ reviewStatus.replace('_', ' ') }}</dd></div><div><dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Reviewed at</dt><dd class="mt-1 text-slate-700">{{ formatDate(reviewedAt) }}</dd></div></dl>
    <label class="mt-4 block text-sm font-medium text-slate-800" for="review-note">Review note <span class="font-normal text-slate-500">(strongly recommended for Needs Fix)</span><textarea id="review-note" v-model="note" rows="3" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Add editorial context or required fixes" /></label>
    <p v-if="error" role="alert" class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error }}</p><p v-if="success" role="status" class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{{ success }}</p>
    <div class="mt-4 flex flex-wrap gap-2"><button type="button" :disabled="saving" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60" @click="saveNote">Save note</button><button type="button" :disabled="saving" class="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 disabled:opacity-60" @click="save('in_review')">Start Review</button><button type="button" :disabled="saving" class="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 disabled:opacity-60" @click="save('needs_fix')">Needs Fix</button><button type="button" :disabled="saving" class="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60" @click="save('approved')">Approve</button><button type="button" :disabled="saving" class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-60" @click="save('unreviewed')">Return to Unreviewed</button></div>
  </section>
</template>
