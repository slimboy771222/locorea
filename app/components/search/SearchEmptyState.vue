<script setup lang="ts">
defineProps<{ query: string }>()

const emit = defineEmits<{ clear: [] }>()
</script>

<template>
  <section class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center sm:px-8">
    <h2 class="text-lg font-semibold text-slate-900">No results for "{{ query }}"</h2>
    <p class="mx-auto mt-2 max-w-md text-[15px] leading-6 text-slate-500">Try a different word, clear your filters, or browse a travel category instead.</p>
    <div class="mt-5 flex flex-wrap justify-center gap-2"><button type="button" class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700" @click="emit('clear')">Clear filters</button><NuxtLink to="/search?type=places" class="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300">Explore Places</NuxtLink><NuxtLink to="/search?type=routes" class="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300">Explore Routes</NuxtLink><NuxtLink to="/search?type=guides" class="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300">Explore Guides</NuxtLink></div>
  </section>
</template>
