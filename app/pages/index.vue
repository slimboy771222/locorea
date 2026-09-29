<script setup lang="ts">
import { discovery } from '~/config/discovery'

const {
  getCuratedPlaces,
  getCuratedRoutes,
} = useHomeData()

const { data: curatedPlaces, pending: placesPending, error: placesError } = await useAsyncData(
  'home-curated-places',
  () => getCuratedPlaces(discovery.worthExploringNow),
)

const { data: curatedRoutes, pending: routesPending, error: routesError } = await useAsyncData(
  'home-curated-routes',
  () => getCuratedRoutes(discovery.featuredRoutes),
)

const hasPlacesError = computed(() => Boolean(placesError.value))
const hasRoutesError = computed(() => Boolean(routesError.value))

useSeoMeta({
  title: 'Locorea — Explore Korea with confidence',
  description:
    'Places, routes, food and practical travel information for visitors to Korea.',
})
</script>

<template>
  <main>
    <HomeHeroSearch />

    <HomeTravelBasics />

    <HomeExploreTypes />

    <HomeWorthExploringNow
      :places="curatedPlaces ?? []"
      :pending="placesPending"
      :failed="hasPlacesError"
    />

    <HomeExploreByRoute
      :routes="curatedRoutes ?? []"
      :pending="routesPending"
      :failed="hasRoutesError"
    />

    <HomeDiscoverThemes />

    <div id="need-help">
      <HomeNeedHelp />
    </div>
  </main>
</template>
