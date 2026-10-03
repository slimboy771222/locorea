<script setup lang="ts">
import { ArrowLeft, ArrowRight, BookOpen, CircleHelp, CreditCard, LoaderCircle, Phone, ShoppingBag, TrainFront } from 'lucide-vue-next'

type LostItem = 'passport' | 'phone' | 'wallet' | 'bag' | 'other'

const selectedItem = ref<LostItem | null>(null)
const unimplementedMessage = ref('')
const { getProblemGuideBySlug } = useProblemGuides()
const { data: passportGuide, pending: isLoadingGuide, error: guideError, execute: loadPassportGuide } = useAsyncData(
  'problem-guide-lost-passport',
  () => getProblemGuideBySlug('lost-passport'),
  { immediate: false },
)
const { data: phoneGuide, pending: isLoadingPhoneGuide, error: phoneGuideError, execute: loadPhoneGuide } = useAsyncData(
  'problem-guide-lost-phone',
  () => getProblemGuideBySlug('lost-phone'),
  { immediate: false },
)
const { data: walletGuide, pending: isLoadingWalletGuide, error: walletGuideError, execute: loadWalletGuide } = useAsyncData(
  'problem-guide-lost-wallet-cards',
  () => getProblemGuideBySlug('lost-wallet-cards'),
  { immediate: false },
)

const selectedGuide = computed(() => selectedItem.value === 'passport' ? passportGuide.value : selectedItem.value === 'phone' ? phoneGuide.value : selectedItem.value === 'wallet' ? walletGuide.value : null)
const isLoadingSelectedGuide = computed(() => selectedItem.value === 'passport' ? isLoadingGuide.value : selectedItem.value === 'phone' ? isLoadingPhoneGuide.value : selectedItem.value === 'wallet' ? isLoadingWalletGuide.value : false)
const selectedGuideError = computed(() => selectedItem.value === 'passport' ? guideError.value : selectedItem.value === 'phone' ? phoneGuideError.value : selectedItem.value === 'wallet' ? walletGuideError.value : null)

const items = [
  { id: 'passport', label: 'Passport', icon: BookOpen },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'wallet', label: 'Wallet / cards', icon: CreditCard },
  { id: 'bag', label: 'Bag / belongings', icon: ShoppingBag },
  { id: 'other', label: 'Something else', icon: CircleHelp },
] as const

const chooseItem = async (item: LostItem) => {
  selectedItem.value = item
  unimplementedMessage.value = ''

  if (item === 'passport' && !passportGuide.value && !isLoadingGuide.value) {
    await loadPassportGuide()
  }
  else if (item === 'phone' && !phoneGuide.value && !isLoadingPhoneGuide.value) {
    await loadPhoneGuide()
  }
  else if (item === 'wallet' && !walletGuide.value && !isLoadingWalletGuide.value) {
    await loadWalletGuide()
  }
  else if (item !== 'passport' && item !== 'phone' && item !== 'wallet') {
    unimplementedMessage.value = 'This guide is being prepared.'
  }
}

const resetItem = () => {
  selectedItem.value = null
  unimplementedMessage.value = ''
}

const retrySelectedGuide = () => selectedItem.value === 'passport' ? loadPassportGuide() : selectedItem.value === 'phone' ? loadPhoneGuide() : loadWalletGuide()

useSeoMeta({ title: 'Lost something — Locorea', description: 'Simple next steps when you lose something during your trip in Korea.' })
</script>

<template>
  <main class="min-h-[calc(100dvh-60px)] bg-slate-50 px-5 py-6 sm:py-8 lg:px-8 lg:py-10">
    <div class="mx-auto max-w-[820px]">
      <NuxtLink to="/" class="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"><ArrowLeft :size="18" aria-hidden="true" />Back</NuxtLink>
      <header class="mt-4 max-w-2xl">
        <h1 class="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Lost something</h1>
        <p class="mt-2 text-[15px] leading-6 text-slate-600 sm:text-base">Don't panic. We'll help you figure out what to do next.</p>
      </header>

      <section class="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="lost-item-heading">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-blue-700">Start here</p>
            <h2 id="lost-item-heading" class="mt-1 text-xl font-bold tracking-tight text-slate-950">What did you lose?</h2>
          </div>
          <button v-if="selectedItem" type="button" class="min-h-10 text-sm font-semibold text-blue-700 transition hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="resetItem">Change</button>
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <button v-for="item in items" :key="item.id" type="button" :aria-pressed="selectedItem === item.id" class="flex min-h-16 items-center gap-3 rounded-xl border px-4 text-left text-[15px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" :class="selectedItem === item.id ? 'border-blue-600 bg-blue-50 text-blue-950' : 'border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-blue-50'" @click="chooseItem(item.id)">
            <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><component :is="item.icon" :size="19" aria-hidden="true" /></span>{{ item.label }}
          </button>
        </div>

        <p v-if="unimplementedMessage" role="status" class="mt-4 text-sm text-slate-600">{{ unimplementedMessage }}</p>
      </section>

      <NuxtLink to="/help/guides/lost-something-on-the-subway" class="mt-4 flex min-h-24 items-center gap-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:p-5">
        <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-blue-700 shadow-sm"><TrainFront :size="21" aria-hidden="true" /></span>
        <span class="min-w-0 flex-1">
          <span class="block text-[15px] font-semibold text-slate-950">Lost it on the subway?</span>
          <span class="mt-1 block text-sm leading-5 text-slate-600">Act quickly with station staff, then check Korea's official lost-and-found system if needed.</span>
        </span>
        <ArrowRight :size="20" class="shrink-0 text-blue-700" aria-hidden="true" />
      </NuxtLink>

      <section v-if="selectedItem === 'passport' || selectedItem === 'phone' || selectedItem === 'wallet'" class="mt-8" aria-live="polite">
        <div v-if="isLoadingSelectedGuide" class="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <div><LoaderCircle :size="28" class="mx-auto animate-spin text-blue-700" aria-hidden="true" /><p class="mt-4 text-sm font-medium text-slate-700">Loading the guide…</p></div>
        </div>
        <div v-else-if="selectedGuideError" class="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p class="text-sm font-medium text-slate-800">We couldn’t load this guide right now.</p>
          <button type="button" class="mt-4 min-h-10 text-sm font-semibold text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="retrySelectedGuide">Try again</button>
        </div>
        <div v-else-if="!selectedGuide" class="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p class="text-sm font-medium text-slate-800">This guide is not available right now.</p>
        </div>
        <ProblemGuideView v-else :guide="selectedGuide" />
      </section>
    </div>
  </main>
</template>
