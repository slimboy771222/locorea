<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { discovery } from '~/config/discovery'

const utilityItems = discovery.help.slice(0, 4)
const lostSomethingItem = discovery.help[4]
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
    <div class="rounded-3xl border border-blue-100 bg-blue-50/75 p-5 md:p-6 lg:p-7">
      <div class="lg:grid lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-center lg:gap-10">
        <div class="max-w-md">
          <p class="text-sm font-semibold text-[var(--lc-coral)]">When something goes wrong</p>
          <h2 class="mt-1 text-[24px] font-bold tracking-tight text-slate-950 md:text-[28px]">Need Help in Korea?</h2>
          <p class="mt-1.5 text-[15px] leading-6 text-slate-600">Practical help when your trip doesn't go as planned.</p>
        </div>

        <div class="mt-5 lg:mt-0">
          <p class="text-[13px] font-semibold text-slate-600">Need help right now?</p>
          <div class="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <NuxtLink
              v-for="item in utilityItems"
              :key="item.key"
              :to="item.to"
              class="group flex min-h-[76px] items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 outline-none transition duration-200 hover:border-blue-200 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <component :is="item.icon" :size="18" aria-hidden="true" />
              </span>
              <span class="min-w-0 text-[14px] font-semibold leading-5 text-slate-900">
                {{ item.label }}
                <span v-if="item.key === 'emergency'" class="block text-xs font-medium text-slate-500">119</span>
              </span>
            </NuxtLink>
          </div>

          <div class="mt-4">
            <p class="text-[13px] font-semibold text-slate-600">Something went wrong?</p>
            <NuxtLink
              :to="lostSomethingItem.to"
              aria-label="Lost something: passport, phone, wallet, or bag"
              class="group mt-2.5 flex min-h-[76px] items-center gap-3 rounded-2xl border border-[var(--lc-coral-subtle)] bg-white p-3 outline-none transition duration-200 hover:bg-[var(--lc-coral-subtle)] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--lc-coral-subtle)] text-[var(--lc-coral)]">
                <component :is="lostSomethingItem.icon" :size="19" aria-hidden="true" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-[15px] font-semibold text-slate-900">{{ lostSomethingItem.label }}</span>
                <span class="mt-0.5 block text-[13px] leading-5 text-slate-600">Passport · Phone · Wallet · Bag</span>
              </span>
              <ArrowRight class="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--lc-coral)]" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
