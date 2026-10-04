<script setup lang="ts">
type FooterGroup = {
  key: string
  title: string
  links: Array<{
    label: string
    to: string
  }>
}

const footerGroups: FooterGroup[] = [
  {
    key: 'explore',
    title: 'Explore',
    links: [
      { label: 'Places', to: '/search?type=places' },
      { label: 'Routes', to: '/search?type=routes' },
      { label: 'Themes', to: '/#discover-themes' },
    ],
  },
  {
    key: 'plan-your-trip',
    title: 'Plan your trip',
    links: [
      { label: 'Guides', to: '/search?type=guides' },
      { label: 'Getting Around', to: '/search?q=getting+around' },
      { label: 'Korea Travel Basics', to: '/#travel-basics' },
    ],
  },
  {
    key: 'help',
    title: 'Help',
    links: [
      { label: 'Need Help in Korea', to: '/#need-help' },
    ],
  },
  {
    key: 'about',
    title: 'About',
    links: [],
  },
]

const openGroups = ref<string[]>([])

const isGroupOpen = (key: string) => openGroups.value.includes(key)

const toggleGroup = (key: string) => {
  openGroups.value = isGroupOpen(key)
    ? openGroups.value.filter(item => item !== key)
    : [...openGroups.value, key]
}
</script>

<template>
  <footer class="border-t border-slate-200 bg-slate-50">
    <div class="mx-auto max-w-7xl px-5 pb-5 pt-7 lg:px-8 lg:pb-6 lg:pt-8">
      <div class="lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
        <div class="max-w-xs">
          <NuxtLink to="/" class="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
            <img src="/brand/locorea-wordmark-primary.png" alt="Locorea" class="h-7 w-auto object-contain">
          </NuxtLink>
          <p class="mt-2 text-sm font-medium text-slate-900">Korea, your way.</p>
          <p class="mt-0.5 text-[13px] leading-5 text-slate-500">Local discovery for travelers.</p>
        </div>

        <div class="mt-5 divide-y divide-slate-200 border-y border-slate-200 md:mt-7 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-7 md:divide-y-0 md:border-y-0 lg:mt-0">
          <section v-for="group in footerGroups" :key="group.key" class="md:min-w-0">
            <template v-if="group.links.length">
              <button
                type="button"
                class="flex min-h-12 w-full items-center justify-between gap-3 text-left text-sm font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 md:hidden"
                :aria-expanded="isGroupOpen(group.key)"
                :aria-controls="`footer-group-${group.key}`"
                @click="toggleGroup(group.key)"
              >
                {{ group.title }}
                <span class="text-lg font-medium leading-none text-slate-500" aria-hidden="true">{{ isGroupOpen(group.key) ? '−' : '+' }}</span>
              </button>
              <h2 class="hidden text-sm font-semibold text-slate-900 md:block">{{ group.title }}</h2>
              <nav
                :id="`footer-group-${group.key}`"
                class="grid gap-2 pb-3 text-sm text-slate-500 md:mt-3 md:grid md:pb-0"
                :class="isGroupOpen(group.key) ? 'grid' : 'hidden'"
                :aria-label="`${group.title} links`"
              >
                <NuxtLink
                  v-for="link in group.links"
                  :key="link.label"
                  :to="link.to"
                  class="w-fit rounded-sm transition hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {{ link.label }}
                </NuxtLink>
              </nav>
            </template>
            <div v-else class="flex min-h-12 items-center text-sm font-semibold text-slate-900 md:min-h-0">
              {{ group.title }}
            </div>
          </section>
        </div>
      </div>

      <div class="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-500 lg:mt-6">
        <p>© {{ new Date().getFullYear() }} Locorea</p>
      </div>
    </div>
  </footer>
</template>
