<script setup lang="ts">
const route = useRoute()

const slug = String(route.params.slug || '')

const { getGuideBySlug } = useGuides()

const { data: guide } = await useAsyncData(
  `guide-${slug}`,
  () => getGuideBySlug(slug),
)

if (!guide.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Guide not found',
  })
}

const content = computed(() =>
  guide.value?.guide_translations?.find(
    item => item.language_code === 'en',
  ),
)

useSeoMeta({
  title: () =>
    content.value
      ? `${content.value.title} — Locorea`
      : 'Guide — Locorea',

  description: () =>
    content.value?.summary || '',
})
</script>

<template>
  <div>
    <AppHeader />

    <main
      class="mx-auto max-w-4xl px-5 py-10 lg:px-8"
    >
      <span
        class="text-sm font-semibold uppercase tracking-wide text-blue-600"
      >
        {{ guide?.guide_type }}
      </span>

      <h1
        class="mt-3 text-4xl font-bold tracking-tight lg:text-5xl"
      >
        {{ content?.title }}
      </h1>

      <p
        class="mt-5 text-lg leading-8 text-slate-600"
      >
        {{ content?.summary }}
      </p>

      <div
        v-if="guide?.last_verified_at"
        class="mt-6 text-sm text-slate-400"
      >
        Last verified:
        {{
          new Date(guide.last_verified_at)
            .toLocaleDateString('en-US')
        }}
      </div>

      <article
        class="mt-10 whitespace-pre-line rounded-3xl border border-slate-200 bg-white p-7 leading-8 text-slate-700 lg:p-10"
      >
        {{ content?.body_markdown }}
      </article>

      <section
        v-if="guide?.sources"
        class="mt-8 rounded-2xl bg-slate-50 p-6"
      >
        <p class="text-xs font-semibold uppercase text-slate-400">
          Source
        </p>

        <p class="mt-2 font-medium">
          {{ guide.sources.name }}
        </p>

        <a
          v-if="guide.sources.url"
          :href="guide.sources.url"
          target="_blank"
          class="mt-3 inline-block text-sm font-medium text-blue-600"
        >
          Official source →
        </a>
      </section>
    </main>
  </div>
</template>