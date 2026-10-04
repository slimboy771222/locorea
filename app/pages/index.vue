<script setup lang="ts">
import { discovery } from '~/config/discovery'

const {
  getCuratedRoutes,
} = useHomeData()

const { data: curatedRoutes, pending: routesPending, error: routesError } = await useAsyncData(
  'home-curated-routes',
  () => getCuratedRoutes(discovery.featuredRoutes),
)

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

    <HomeWorthExploringNow />

    <HomeTravelBasics />

    <HomeExploreTypes />

    <HomeExploreByRoute
      :routes="curatedRoutes ?? []"
      :pending="routesPending"
      :failed="hasRoutesError"
    />

    <HomeDiscoverThemes />

    <div id="need-help" class="scroll-mt-20">
      <HomeNeedHelp />
    </div>
  </main>
</template>
