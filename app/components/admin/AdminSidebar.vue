<script setup lang="ts">
import { ArrowLeft, Building2, LayoutDashboard, MapPinned, Route, BookOpen, Image, X } from 'lucide-vue-next'

defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()

const navigation = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Places', to: '/admin/places', icon: MapPinned },
  { label: 'Routes', to: '/admin/routes', icon: Route },
]

const futureNavigation = [
  { label: 'Guides', icon: BookOpen },
  { label: 'Media', icon: Image },
]
</script>

<template>
  <aside class="hidden h-screen w-60 shrink-0 border-r border-slate-200 bg-slate-950 text-slate-300 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col">
    <div class="flex h-16 items-center gap-2 border-b border-white/10 px-5"><Building2 :size="20" class="text-blue-400" /><span class="font-semibold text-white">Locorea Admin</span></div>
    <nav class="flex-1 space-y-1 px-3 py-5" aria-label="Admin navigation">
      <NuxtLink v-for="item in navigation" :key="item.label" :to="item.to" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-white/10 hover:text-white" active-class="bg-white/10 text-white"><component :is="item.icon" :size="18" />{{ item.label }}</NuxtLink>
      <div class="mt-6 border-t border-white/10 pt-4">
        <span v-for="item in futureNavigation" :key="item.label" class="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500"><component :is="item.icon" :size="18" />{{ item.label }}</span>
      </div>
    </nav>
    <div class="border-t border-white/10 p-3"><NuxtLink to="/" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/10 hover:text-white"><ArrowLeft :size="18" />Back to Locorea</NuxtLink></div>
  </aside>

  <div v-if="open" class="fixed inset-0 z-50 lg:hidden">
    <button type="button" class="absolute inset-0 bg-slate-950/40" aria-label="Close admin navigation" @click="$emit('close')" />
    <aside class="relative flex h-full w-72 flex-col bg-slate-950 text-slate-300 shadow-xl">
      <div class="flex h-16 items-center justify-between border-b border-white/10 px-5"><span class="font-semibold text-white">Locorea Admin</span><button type="button" class="rounded-md p-2 text-slate-300 hover:bg-white/10" aria-label="Close admin navigation" @click="$emit('close')"><X :size="20" /></button></div>
      <nav class="flex-1 space-y-1 px-3 py-5" aria-label="Admin navigation"><NuxtLink v-for="item in navigation" :key="item.label" :to="item.to" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/10 hover:text-white" active-class="bg-white/10 text-white" @click="$emit('close')"><component :is="item.icon" :size="18" />{{ item.label }}</NuxtLink><div class="mt-6 border-t border-white/10 pt-4"><span v-for="item in futureNavigation" :key="item.label" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500"><component :is="item.icon" :size="18" />{{ item.label }}</span></div></nav>
      <div class="border-t border-white/10 p-3"><NuxtLink to="/" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/10 hover:text-white"><ArrowLeft :size="18" />Back to Locorea</NuxtLink></div>
    </aside>
  </div>
</template>
