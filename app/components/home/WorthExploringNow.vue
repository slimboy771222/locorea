<script setup lang="ts">
type CuratedContentType = 'place' | 'route' | 'theme' | 'guide' | 'story'
type CuratedRole = 'featured' | 'supporting'

type CuratedItem = {
  id: string
  contentType: CuratedContentType
  contentId: string | null
  role: CuratedRole
  badge: 'NOW' | 'THIS WEEK' | 'LOCAL PICK' | 'TRENDING'
  title: string
  meta: string
  imageUrl: string
  imageAlt: string
  destination: string
  sortOrder: number
  activeFrom?: string
  activeUntil?: string
}

const curatedItems = [
  {
    id: 'namsan-autumn-night',
    contentType: 'theme',
    contentId: null,
    role: 'featured',
    badge: 'NOW',
    title: "Enjoy Seoul's best autumn night walk",
    meta: 'Namsan · Seasonal',
    imageUrl: '/images/home/worth-exploring/namsan-autumn-night.webp',
    imageAlt: 'Namsan at night in autumn',
    destination: '/search?q=Namsan',
    sortOrder: 1,
  },
  {
    id: 'seongsu-popups',
    contentType: 'theme',
    contentId: null,
    role: 'supporting',
    badge: 'THIS WEEK',
    title: 'Seongsu pop-ups worth checking',
    meta: 'Seongsu · Cafes',
    imageUrl: '/images/home/worth-exploring/seongsu-popups.webp',
    imageAlt: 'A Seongsu pop-up storefront',
    destination: '/search?q=Seongsu',
    sortOrder: 2,
  },
  {
    id: 'han-river-sunset-bike',
    contentType: 'route',
    contentId: null,
    role: 'supporting',
    badge: 'LOCAL PICK',
    title: 'Ride the Han River at sunset',
    meta: 'Seoul · Outdoor',
    imageUrl: '/images/home/worth-exploring/han-river-sunset-bike.webp',
    imageAlt: 'Cycling beside the Han River at sunset',
    destination: '/search?q=Han+River',
    sortOrder: 3,
  },
  {
    id: 'seoul-night-market',
    contentType: 'theme',
    contentId: null,
    role: 'supporting',
    badge: 'TRENDING',
    title: 'Night markets locals love',
    meta: 'Seoul · Food',
    imageUrl: '/images/home/worth-exploring/seoul-night-market.webp',
    imageAlt: 'A Seoul night market',
    destination: '/search?type=places&place_type=restaurant',
    sortOrder: 4,
  },
] satisfies CuratedItem[]

const featuredItem = curatedItems.find(item => item.role === 'featured')!
const supportingItems = curatedItems.filter(item => item.role === 'supporting')
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-9 sm:py-10 lg:px-8 lg:py-14">
    <div class="mb-4">
      <p class="text-[12px] font-semibold uppercase tracking-[0.12em] text-blue-700">Curated for you</p>
      <div class="mt-1.5 flex items-end justify-between gap-4">
        <h2 class="text-[26px] font-bold tracking-tight text-slate-950 md:text-[28px]">Worth Exploring Now</h2>
        <span class="mb-1 shrink-0 text-sm font-semibold text-blue-700" aria-label="Curated archive coming soon">See all <span aria-hidden="true">→</span></span>
      </div>
      <p class="mt-1.5 text-[15px] leading-6 text-slate-600">Fresh picks for a more interesting Korea trip.</p>
    </div>

    <NuxtLink
      :to="featuredItem.destination"
      :aria-label="`${featuredItem.title}. ${featuredItem.meta}`"
      class="group relative isolate block aspect-video overflow-hidden rounded-2xl bg-slate-900 outline-none transition focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:max-w-4xl"
    >
      <img
        :src="featuredItem.imageUrl"
        :alt="featuredItem.imageAlt"
        class="absolute inset-0 -z-20 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
      >
      <div class="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(8,18,36,0.78)_0%,rgba(8,18,36,0.28)_46%,rgba(8,18,36,0.04)_100%)]" />
      <span class="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-slate-800">{{ featuredItem.badge }}</span>
      <div class="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 class="max-w-lg text-[22px] font-bold leading-7 tracking-tight text-white sm:text-[26px]">{{ featuredItem.title }}</h3>
        <p class="mt-1 text-sm font-medium text-white/85">{{ featuredItem.meta }}</p>
      </div>
    </NuxtLink>

    <div class="mt-4 flex max-w-full snap-x snap-proximity gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-5 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
      <NuxtLink
        v-for="item in supportingItems"
        :key="item.id"
        :to="item.destination"
        :aria-label="`${item.title}. ${item.meta}`"
        class="group w-[152px] shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white outline-none transition hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
      >
        <div class="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img :src="item.imageUrl" :alt="item.imageAlt" class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]">
          <span class="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold tracking-[0.07em] text-slate-700">{{ item.badge }}</span>
        </div>
        <div class="p-3">
          <h3 class="line-clamp-2 text-[16px] font-semibold leading-5 text-slate-900">{{ item.title }}</h3>
          <p class="mt-1 truncate text-[13px] leading-4 text-slate-500">{{ item.meta }}</p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
