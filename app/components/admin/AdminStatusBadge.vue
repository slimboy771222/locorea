<script setup lang="ts">
defineProps<{
  status: string
}>()

const statusClasses: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  draft: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  archived: 'bg-slate-100 text-slate-600 ring-slate-500/15',
}
</script>

<template>
  <span
    class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset"
    :class="statusClasses[status] ?? 'bg-slate-100 text-slate-600 ring-slate-500/15'"
  >
    {{ status }}
  </span>
</template>
