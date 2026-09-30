<template>
  <footer class="border-t border-slate-200 bg-slate-50">
    <div class="mx-auto max-w-7xl px-5 pb-6 pt-8 sm:pt-9 lg:px-8 lg:pb-7 lg:pt-10">
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
        <div>
          <NuxtLink to="/" class="inline-flex">
            <img src="/brand/locorea-wordmark-primary.png" alt="Locorea" class="h-7 w-auto object-contain">
          </NuxtLink>
          <p class="mt-2.5 text-sm font-medium text-slate-900">Korea, your way.</p>
          <p class="mt-0.5 max-w-xs text-[13px] leading-5 text-slate-500">Local discovery, structured for travelers.</p>
        </div>
        <div><h2 class="text-sm font-semibold text-slate-900">Explore</h2><nav class="mt-3 grid gap-2 text-sm text-slate-500"><NuxtLink to="/search?type=places">Places</NuxtLink><NuxtLink to="/search?type=routes">Routes</NuxtLink><NuxtLink to="/search?type=places&place_type=restaurant">Food</NuxtLink><NuxtLink to="/#discover-themes">Themes</NuxtLink></nav></div>
        <div><h2 class="text-sm font-semibold text-slate-900">Plan Your Trip</h2><nav class="mt-3 grid gap-2 text-sm text-slate-500"><NuxtLink to="/search?type=guides">Guides</NuxtLink><NuxtLink to="/search?q=getting+around">Getting Around</NuxtLink><NuxtLink to="/#travel-basics">Korea Travel Basics</NuxtLink></nav></div>
        <div><h2 class="text-sm font-semibold text-slate-900">Help</h2><nav class="mt-3 grid gap-2 text-sm text-slate-500"><NuxtLink to="/#need-help">Need Help</NuxtLink></nav></div>
      </div>
      <div class="mt-6 flex border-t border-slate-200 pt-4 text-sm text-slate-500 sm:mt-8 sm:pt-5"><p>© {{ new Date().getFullYear() }} Locorea</p></div>
    </div>
  </footer>
</template>
