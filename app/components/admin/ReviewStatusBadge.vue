<script setup lang="ts">
import type { ReviewStatus } from '~/composables/useAdminReview'

defineProps<{ status: string }>()

const statusClasses: Record<ReviewStatus, string> = {
  unreviewed: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  in_review: 'bg-blue-50 text-blue-700 ring-blue-600/15',
  needs_fix: 'bg-rose-50 text-rose-700 ring-rose-600/15',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
}
</script>

<template>
  <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset" :class="statusClasses[status as ReviewStatus] ?? 'bg-slate-100 text-slate-600 ring-slate-500/15'">
    {{ status.replace('_', ' ') }}
  </span>
</template>
