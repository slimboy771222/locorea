<template>
  <footer class="border-t border-slate-200 bg-slate-50">
    <div class="mx-auto max-w-7xl px-5 py-7 lg:py-8 lg:px-8">
      <div class="grid gap-6 sm:grid-cols-2 lg:gap-7 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div><NuxtLink to="/" class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">L</span><span class="text-xl font-bold tracking-tight">Locorea</span></NuxtLink><p class="mt-3 max-w-xs text-sm leading-5 text-slate-500">Your trusted guide to explore Korea. Travel data, tips and practical information for a better journey.</p></div>
        <div><h2 class="text-sm font-semibold text-slate-900">Explore</h2><nav class="mt-3 grid gap-2 text-sm text-slate-500"><NuxtLink to="/places">Places</NuxtLink><NuxtLink to="/routes">Routes</NuxtLink><NuxtLink to="/search?q=food">Food</NuxtLink><NuxtLink to="/search?q=theme">Themes</NuxtLink></nav></div>
        <div><h2 class="text-sm font-semibold text-slate-900">Plan Your Trip</h2><nav class="mt-3 grid gap-2 text-sm text-slate-500"><NuxtLink to="/guides">Guides</NuxtLink><NuxtLink to="/search?q=events">Events</NuxtLink><NuxtLink to="/search?q=getting+around">Getting Around</NuxtLink><NuxtLink to="/search?q=Korea+101">Korea 101</NuxtLink></nav></div>
        <div><h2 class="text-sm font-semibold text-slate-900">Help</h2><nav class="mt-3 grid gap-2 text-sm text-slate-500"><NuxtLink to="/#travel-basics">Korea Travel Basics</NuxtLink><NuxtLink to="/#need-help">Need Help</NuxtLink><NuxtLink to="/search?q=FAQ">FAQ</NuxtLink></nav></div>
      </div>
      <div class="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 sm:mt-8 sm:pt-5 sm:flex-row sm:items-center sm:justify-between"><p>© {{ new Date().getFullYear() }} Locorea</p><div class="flex gap-5"><NuxtLink to="/search?q=privacy">Privacy</NuxtLink><NuxtLink to="/search?q=terms">Terms</NuxtLink><NuxtLink to="/search?q=contact">Contact</NuxtLink></div></div>
    </div>
  </footer>
</template>
