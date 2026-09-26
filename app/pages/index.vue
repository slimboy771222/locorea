<script setup lang="ts">
const {
  getPopularPlaces,
  getPopularGuides,
} = useHomeData()

const { data: homeData, pending, error } = await useAsyncData(
  'home-data',
  async () => {
    const [places, popularGuides] = await Promise.all([
      getPopularPlaces(),
      getPopularGuides(),
    ])

    return {
      places,
      popularGuides,
    }
  },
)

const popularItems = computed(() => [
  ...(homeData.value?.places ?? []).map(place => ({
    id: place.id,
    slug: place.slug,
    kind: 'place' as const,
    type: place.place_type,
    translations: place.place_translations,
    cover: place.cover,
  })),

  ...(homeData.value?.popularGuides ?? []).map(guide => ({
    id: guide.id,
    slug: guide.slug,
    kind: 'guide' as const,
    type: guide.guide_type,
    translations: guide.guide_translations,
    cover: guide.cover,
  })),
].slice(0, 5))

const hasError = computed(() => Boolean(error.value))

useSeoMeta({
  title: 'Locorea — Explore Korea with confidence',
  description:
    'Places, routes, food and practical travel information for visitors to Korea.',
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <LayoutAppHeader />

    <main>
      <HomeHeroSearch />

      <HomeTravelBasics />

      <HomeExploreTypes />

      <HomePopularNow
        :items="popularItems"
        :pending="pending"
        :failed="hasError"
      />

      <HomeDiscoverThemes />

      <div id="need-help">
        <HomeNeedHelp />
      </div>
    </main>

    <LayoutAppFooter />
  </div>
</template>
