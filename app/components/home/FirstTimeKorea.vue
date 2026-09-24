<script setup lang="ts">
import { PlaneLanding, Wifi, CreditCard, TrainFront, Hotel, Map } from 'lucide-vue-next'

const steps = [
  { label: 'Arrive at Incheon Airport', to: '/search?q=Incheon+Airport', icon: PlaneLanding },
  { label: 'Get Internet', to: '/guides/sim-vs-esim-in-korea', icon: Wifi },
  { label: 'Get a Transport Card', to: '/guides/t-money-vs-climate-card', icon: CreditCard },
  { label: 'Airport → Seoul', to: '/search?q=airport+to+Seoul', icon: TrainFront },
  { label: 'Check in to Your Hotel', to: '/search?q=hotel+check-in', icon: Hotel },
  { label: 'Get Around', to: '/guides/how-to-use-seoul-subway', icon: Map },
]
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-9 lg:px-8">
    <div class="mb-5">
      <p class="text-sm font-medium text-blue-600">A simple starting point</p>
      <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">First Time in Korea</h2>
      <p class="mt-1 text-sm text-slate-500">Six practical steps from arrival to your first day out.</p>
    </div>
    <ol class="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
      <li v-for="(step, index) in steps" :key="step.label" class="min-w-48 snap-start lg:min-w-0">
        <NuxtLink :to="step.to" class="group block h-full rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-md">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-blue-600">0{{ index + 1 }}</span>
            <component :is="step.icon" :size="20" class="text-slate-400 group-hover:text-blue-600" />
          </div>
          <h3 class="mt-6 text-sm font-semibold leading-5 text-slate-900">{{ step.label }}</h3>
        </NuxtLink>
      </li>
    </ol>
  </section>
</template>
