<script setup lang="ts">
const route = useRoute()

const slug = String(route.params.slug || '')

const { getRouteBySlug } = useRoutes()

const { data: routeData } = await useAsyncData(
  `route-${slug}`,
  () => getRouteBySlug(slug),
)

if (!routeData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Route not found',
  })
}

const content = computed(() =>
  routeData.value?.route_translations?.find(
    item => item.language_code === 'en',
  ),
)

const getPlaceContent = (place: any) =>
  place.place_translations?.find(
    (item: any) => item.language_code === 'en',
  )
</script>

<template>
  <div>
    <LayoutAppHeader />

    <main class="mx-auto max-w-5xl px-5 py-10 lg:px-8">
      <span
        class="text-sm font-semibold uppercase text-blue-600"
      >
        Route
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

      <div class="mt-6 flex flex-wrap gap-3">
        <span class="rounded-full bg-slate-100 px-4 py-2 text-sm">
          {{ routeData?.duration_minutes }} min
        </span>

        <span
          v-if="routeData?.distance_km"
          class="rounded-full bg-slate-100 px-4 py-2 text-sm"
        >
          {{ routeData.distance_km }} km
        </span>

        <span
          class="rounded-full bg-slate-100 px-4 py-2 text-sm capitalize"
        >
          {{ routeData?.difficulty }}
        </span>
      </div>

      <div
        class="mt-10 aspect-[16/6] rounded-3xl bg-slate-100"
      >
        <div
          class="flex h-full items-center justify-center text-slate-400"
        >
          Map will be added here
        </div>
      </div>

      <section class="mt-12">
        <h2 class="text-2xl font-bold">
          Your Route
        </h2>

        <div class="mt-8">
          <div
            v-for="(stop, index) in routeData?.route_places"
            :key="stop.stop_order"
            class="relative flex gap-5 pb-10"
          >
            <div class="flex flex-col items-center">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white"
              >
                {{ stop.stop_order }}
              </div>

              <div
                v-if="index < (routeData?.route_places.length || 0) - 1"
                class="mt-2 h-full w-px bg-slate-200"
              />
            </div>

            <div class="flex-1 pb-4">
              <NuxtLink
                :to="`/places/${stop.places?.slug}`"
                class="text-xl font-semibold hover:text-blue-600"
              >
                {{ getPlaceContent(stop.places)?.name }}
              </NuxtLink>

              <p
                class="mt-2 text-sm leading-6 text-slate-500"
              >
                {{ stop.note }}
              </p>

              <div class="mt-3 flex gap-4 text-xs text-slate-400">
                <span v-if="stop.stay_minutes">
                  Stay {{ stop.stay_minutes }} min
                </span>

                <span v-if="stop.travel_minutes_to_next">
                  Next stop {{ stop.travel_minutes_to_next }} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
