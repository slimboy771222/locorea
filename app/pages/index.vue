<script setup lang="ts">
const { getPopularPlaces, getFeaturedGuides } = useHomeData()

const {
  data: homeData,
  pending,
  error,
} = await useAsyncData(
  'home-data',
  async () => {
    const [
      places,
      guides,
    ] = await Promise.all([
      getPopularPlaces(),
      getFeaturedGuides(),
    ])

    return {
      places,
      guides,
    }
  },
)

useSeoMeta({
  title: 'Locorea — Explore Korea with confidence',
  description:
    'Places, routes, food and practical travel information for visitors to Korea.',
})
</script>

<template>
  <div>
    <AppHeader />

    <HeroSearch />

    <ExploreTypes />

    <section
      class="mx-auto max-w-7xl px-5 py-8 lg:px-8"
    >
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold">
            Popular Right Now
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Useful places and travel information for your Korea trip.
          </p>
        </div>

        <NuxtLink
          to="/search"
          class="text-sm font-medium text-blue-600"
        >
          View all →
        </NuxtLink>
      </div>

      <p v-if="pending">
        Loading...
      </p>

      <p
        v-else-if="error"
        class="text-red-600"
      >
        Failed to load travel data.
      </p>

      <div
        v-else
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <NuxtLink
          v-for="place in homeData?.places"
          :key="place.id"
          :to="`/places/${place.slug}`"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div
            class="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200"
          />

          <div class="p-4">
            <span
              class="text-xs font-semibold uppercase text-blue-600"
            >
              {{ place.place_type }}
            </span>

            <h3 class="mt-2 text-lg font-semibold">
              {{
                place.place_translations?.find(
                  item => item.language_code === 'en',
                )?.name
              }}
            </h3>

            <p class="mt-2 text-sm leading-6 text-slate-500">
              {{
                place.place_translations?.find(
                  item => item.language_code === 'en',
                )?.summary
              }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="bg-blue-50/60">
      <div
        class="mx-auto max-w-7xl px-5 py-10 lg:px-8"
      >
        <h2 class="text-2xl font-bold">
          Korea Travel Essentials
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Practical guides to help you enjoy a smoother trip.
        </p>

        <div
          class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <NuxtLink
            v-for="guide in homeData?.guides"
            :key="guide.id"
            :to="`/guides/${guide.slug}`"
            class="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
          >
            <span class="text-xs font-semibold uppercase text-blue-600">
              {{ guide.guide_type }}
            </span>

            <h3 class="mt-2 font-semibold">
              {{
                guide.guide_translations?.find(
                  item => item.language_code === 'en',
                )?.title
              }}
            </h3>

            <p class="mt-2 text-sm leading-6 text-slate-500">
              {{
                guide.guide_translations?.find(
                  item => item.language_code === 'en',
                )?.summary
              }}
            </p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>