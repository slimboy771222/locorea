<script setup lang="ts">
const route = useRoute()

const slug = computed(() =>
  String(route.params.slug || ''),
)

const { getPlaceBySlug } = usePlaces()

const { data: place, error } = await useAsyncData(
  `place-${slug.value}`,
  () => getPlaceBySlug(slug.value),
)

if (!place.value && !error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Place not found',
  })
}

const content = computed(() =>
  place.value?.place_translations?.find(
    item => item.language_code === 'en',
  ),
)

const areaName = computed(() =>
  place.value?.areas?.area_translations?.find(
    item => item.language_code === 'en',
  )?.name,
)

useSeoMeta({
  title: () =>
    content.value
      ? `${content.value.name} — Locorea`
      : 'Place — Locorea',

  description: () =>
    content.value?.summary || '',
})
</script>

<template>
  <div>
    <AppHeader />

    <main
      v-if="place"
      class="mx-auto max-w-6xl px-5 py-10 lg:px-8"
    >
      <div class="text-sm text-slate-500">
        Explore
        <span class="mx-2">›</span>
        {{ areaName }}
        <span class="mx-2">›</span>
        {{ content?.name }}
      </div>

      <section class="mt-6">
        <span
          class="text-sm font-semibold uppercase tracking-wide text-blue-600"
        >
          {{ place.place_type }}
        </span>

        <h1
          class="mt-2 text-4xl font-bold tracking-tight lg:text-5xl"
        >
          {{ content?.name }}
        </h1>

        <p
          class="mt-4 max-w-3xl text-lg leading-8 text-slate-600"
        >
          {{ content?.summary }}
        </p>
      </section>

      <!-- Image placeholder -->
      <div
        class="mt-8 aspect-[16/7] rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200"
      />

      <div
        class="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]"
      >
        <article>
          <h2 class="text-2xl font-bold">
            About
          </h2>

          <p
            class="mt-4 whitespace-pre-line leading-8 text-slate-600"
          >
            {{ content?.description }}
          </p>

          <section
            v-if="content?.local_tip"
            class="mt-8 rounded-2xl bg-blue-50 p-6"
          >
            <p class="text-sm font-semibold text-blue-700">
              Locorea Tip
            </p>

            <p class="mt-2 leading-7 text-slate-700">
              {{ content.local_tip }}
            </p>
          </section>
        </article>

        <aside>
          <div
            class="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <dl class="space-y-5">
              <div>
                <dt class="text-xs font-semibold uppercase text-slate-400">
                  Area
                </dt>
                <dd class="mt-1 font-medium">
                  {{ areaName }}
                </dd>
              </div>

              <div v-if="content?.address_text">
                <dt class="text-xs font-semibold uppercase text-slate-400">
                  Address
                </dt>
                <dd class="mt-1 text-sm leading-6">
                  {{ content.address_text }}
                </dd>
              </div>

              <div v-if="place.foreigner_friendly !== null">
                <dt class="text-xs font-semibold uppercase text-slate-400">
                  Traveler friendly
                </dt>
                <dd class="mt-1 text-sm">
                  {{ place.foreigner_friendly ? 'Yes' : 'Unknown' }}
                </dd>
              </div>

              <div v-if="place.last_verified_at">
                <dt class="text-xs font-semibold uppercase text-slate-400">
                  Last verified
                </dt>
                <dd class="mt-1 text-sm">
                  {{
                    new Date(place.last_verified_at)
                      .toLocaleDateString('en-US')
                  }}
                </dd>
              </div>
            </dl>

            <div class="mt-6 space-y-2">
              <a
                v-if="place.naver_map_url"
                :href="place.naver_map_url"
                target="_blank"
                class="block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium"
              >
                Open in Naver Map
              </a>

              <a
                v-if="place.kakao_map_url"
                :href="place.kakao_map_url"
                target="_blank"
                class="block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium"
              >
                Open in Kakao Map
              </a>

              <a
                v-if="place.website_url"
                :href="place.website_url"
                target="_blank"
                class="block rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-medium text-white"
              >
                Official Website
              </a>
            </div>
          </div>

          <div
            v-if="place.sources"
            class="mt-5 rounded-2xl bg-slate-50 p-5"
          >
            <p class="text-xs font-semibold uppercase text-slate-400">
              Source
            </p>

            <p class="mt-2 text-sm font-medium">
              {{ place.sources.name }}
            </p>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>