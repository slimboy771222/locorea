<script setup lang="ts">
import type { ProblemGuideAction, ProblemGuideChoiceData } from '~/types/problem-guide'

const props = defineProps<{
  interactionData: ProblemGuideChoiceData
  actions: ProblemGuideAction[]
}>()

const selectedKey = ref<string | null>(null)
const selectedOption = computed(() => props.interactionData.options.find(option => option.key === selectedKey.value) ?? null)
const selectedActions = computed(() => {
  const keys = selectedOption.value?.actionKeys ?? []
  return props.actions.filter(action => action.actionKey && keys.includes(action.actionKey))
})
</script>

<template>
  <div class="rounded-xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
    <p class="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Choose what fits</p>
    <h3 class="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{{ interactionData.prompt }}</h3>

    <div class="mt-5 grid gap-2 sm:grid-cols-2" role="group" :aria-label="interactionData.prompt">
      <button
        v-for="option in interactionData.options"
        :key="option.key"
        type="button"
        :aria-pressed="selectedKey === option.key"
        class="min-h-12 rounded-lg border px-3.5 py-2.5 text-left text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        :class="selectedKey === option.key ? 'border-blue-600 bg-white text-blue-950' : 'border-blue-100 bg-white/75 text-slate-800 hover:border-blue-300 hover:bg-white'"
        @click="selectedKey = option.key"
      >
        {{ option.label }}
      </button>
    </div>

    <div v-if="selectedOption" class="mt-5 border-t border-blue-100 pt-5">
      <h4 class="text-lg font-bold tracking-tight text-slate-950">{{ selectedOption.title }}</h4>
      <GuideBody :content="selectedOption.bodyMarkdown" />
      <ProblemGuideActions v-if="selectedActions.length" :actions="selectedActions" />
    </div>
  </div>
</template>
