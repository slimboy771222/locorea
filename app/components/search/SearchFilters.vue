<script setup lang="ts">
import type { SearchFilters, SearchTab } from '~/composables/useSearch'

const props = defineProps<{
  active: SearchTab
  filters: SearchFilters
  placeTypes: string[]
  areas: Array<{ slug: string; name: string }>
  routeTypes: string[]
  difficulties: string[]
  guideTypes: string[]
}>()

const emit = defineEmits<{
  update: [filters: SearchFilters]
}>()

const label = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
const update = (key: keyof SearchFilters, value: string) => emit('update', { ...props.filters, [key]: value || undefined })
</script>

<template>
  <div v-if="props.active !== 'all'" class="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
    <div class="flex min-w-max gap-2 py-4">
      <template v-if="props.active === 'places'">
        <label class="sr-only" for="search-place-type">Place type</label>
        <select id="search-place-type" :value="props.filters.placeType ?? ''" class="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500" @change="update('placeType', ($event.target as HTMLSelectElement).value)">
          <option value="">All place types</option>
          <option v-for="type in props.placeTypes" :key="type" :value="type">{{ label(type) }}</option>
        </select>
        <label class="sr-only" for="search-area">Area</label>
        <select id="search-area" :value="props.filters.area ?? ''" class="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500" @change="update('area', ($event.target as HTMLSelectElement).value)">
          <option value="">All areas</option>
          <option v-for="area in props.areas" :key="area.slug" :value="area.slug">{{ area.name }}</option>
        </select>
      </template>
      <template v-else-if="props.active === 'routes'">
        <label class="sr-only" for="search-route-type">Route type</label>
        <select id="search-route-type" :value="props.filters.routeType ?? ''" class="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500" @change="update('routeType', ($event.target as HTMLSelectElement).value)">
          <option value="">All route types</option>
          <option v-for="type in props.routeTypes" :key="type" :value="type">{{ label(type) }}</option>
        </select>
        <label class="sr-only" for="search-difficulty">Difficulty</label>
        <select id="search-difficulty" :value="props.filters.difficulty ?? ''" class="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500" @change="update('difficulty', ($event.target as HTMLSelectElement).value)">
          <option value="">All difficulties</option>
          <option v-for="difficulty in props.difficulties" :key="difficulty" :value="difficulty">{{ label(difficulty) }}</option>
        </select>
      </template>
      <template v-else>
        <label class="sr-only" for="search-guide-type">Guide type</label>
        <select id="search-guide-type" :value="props.filters.guideType ?? ''" class="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500" @change="update('guideType', ($event.target as HTMLSelectElement).value)">
          <option value="">All guide types</option>
          <option v-for="type in props.guideTypes" :key="type" :value="type">{{ label(type) }}</option>
        </select>
      </template>
    </div>
  </div>
</template>
