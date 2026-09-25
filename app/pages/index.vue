<script setup lang="ts">
const {
  getPopularPlaces,
  getPopularGuides,
  getFeaturedGuides,
} = useHomeData()

const { data: homeData, pending, error } = await useAsyncData(
  'home-data',
  async () => {
    const [places, popularGuides, guides] = await Promise.all([
      getPopularPlaces(),
      getPopularGuides(),
      getFeaturedGuides(),
    ])

    return {
      places,
      popularGuides,
      guides,
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

      <HomeExploreTypes />

      <HomePopularNow
        :items="popularItems"
        :pending="pending"
        :failed="hasError"
      />

      <HomeTravelEssentials
        :guides="homeData?.guides ?? []"
        :pending="pending"
        :failed="hasError"
      />

      <div id="first-time">
        <HomeFirstTimeKorea />
      </div>

      <HomeDiscoverThemes />

      <div id="need-help">
        <HomeNeedHelp />
      </div>
    </main>

    <LayoutAppFooter />
  </div>
</template>
