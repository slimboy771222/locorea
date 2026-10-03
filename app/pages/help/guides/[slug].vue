<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { getProblemGuideBySlug } = useProblemGuides()
const { data: guide, pending, error } = await useAsyncData(
  () => `problem-guide-page-${slug.value}`,
  () => getProblemGuideBySlug(slug.value),
)

useSeoMeta({
  title: () => guide.value ? `${guide.value.title} — Locorea` : 'Guide — Locorea',
  description: () => guide.value?.summary ?? 'Practical travel help for Korea.',
})
</script>

<template>
  <main class="min-h-[calc(100dvh-60px)] bg-slate-50 px-5 py-6 sm:py-8 lg:px-8 lg:py-10">
    <div class="mx-auto max-w-[820px]">
      <NuxtLink to="/help/lost-something" class="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Back to lost-item help</NuxtLink>
      <div v-if="pending" class="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading guide…</div>
      <div v-else-if="error" class="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">We couldn’t load this guide right now.</div>
      <div v-else-if="!guide" class="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">This guide is not available right now.</div>
      <ProblemGuideView v-else class="mt-7" :guide="guide" />
    </div>
  </main>
</template>
