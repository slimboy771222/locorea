<script setup lang="ts">
import type { SearchTab } from '~/composables/useSearch'

const props = defineProps<{
  active: SearchTab
  counts: Record<SearchTab, number>
}>()

const emit = defineEmits<{
  select: [tab: SearchTab]
}>()

const tabs: Array<{ key: SearchTab; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'places', label: 'Places' },
  { key: 'routes', label: 'Routes' },
  { key: 'guides', label: 'Guides' },
]
</script>

<template>
  <nav aria-label="Search result types" class="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
    <div class="flex min-w-max gap-2 border-b border-slate-200">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="border-b-2 px-3 py-3 text-sm font-semibold transition"
        :class="props.active === tab.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-900'"
        @click="emit('select', tab.key)"
      >
        {{ tab.label }} <span class="ml-1 text-xs font-medium text-slate-400">{{ props.counts[tab.key] }}</span>
      </button>
    </div>
  </nav>
</template>
