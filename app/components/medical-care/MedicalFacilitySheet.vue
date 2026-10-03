<script setup lang="ts">
import { ChevronDown, ChevronUp, Clock3, Footprints, MapPin, Phone, Stethoscope } from 'lucide-vue-next'
import type { NearbyMedicalFacility } from '~/types/medical-facilities'
import { formatMedicalFacilityType } from '~/utils/medical-facility'
import { pharmacyTelHref } from '~/utils/pharmacy'

const props = defineProps<{ facility: NearbyMedicalFacility | null, resultCount: number, openCount: number, selectionVersion: number }>()
defineEmits<{ directions: [] }>()
const isCollapsed = ref(false)

const formatDistance = (meters: number) => meters < 1000 ? `${Math.round(meters)} m away` : `${(meters / 1000).toFixed(1)} km away`
const formatTime = (value: string | null) => value && /^\d{3,4}$/.test(value) ? `${value.padStart(4, '0').slice(0, 2)}:${value.padStart(4, '0').slice(2)}` : value
const status = (facility: NearbyMedicalFacility) => facility.is_open_now === true ? `Open now${facility.closing_time ? ` · until ${formatTime(facility.closing_time)}` : ''}` : facility.is_open_now === false ? 'Closed' : 'Hours unavailable'
const statusClass = (facility: NearbyMedicalFacility) => facility.is_open_now === true ? 'text-emerald-700' : facility.is_open_now === false ? 'text-slate-600' : 'text-slate-500'
const secondaryText = (facility: NearbyMedicalFacility) => facility.description_ko ?? facility.note_ko

watch(() => props.facility?.id, () => { isCollapsed.value = false })
watch(() => props.selectionVersion, () => { isCollapsed.value = false })
</script>

<template>
  <section class="rounded-t-2xl border border-slate-200 bg-white p-5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] lg:rounded-2xl lg:shadow-lg" aria-live="polite">
    <template v-if="facility">
      <div class="mb-3 lg:hidden">
        <span class="mx-auto block h-1 w-9 rounded-full bg-slate-300" aria-hidden="true"></span>
        <button type="button" class="mt-3 flex w-full items-center justify-between gap-3 text-left" :aria-expanded="!isCollapsed" @click="isCollapsed = !isCollapsed">
          <span v-if="isCollapsed" class="min-w-0"><span class="block truncate text-sm font-semibold text-slate-950">{{ facility.name_ko }}</span><span class="mt-0.5 block text-xs font-medium" :class="statusClass(facility)">{{ status(facility) }}</span></span>
          <span v-else class="text-sm font-medium text-slate-600">Medical facility details</span>
          <ChevronDown v-if="!isCollapsed" :size="18" class="shrink-0 text-slate-500" aria-hidden="true" /><ChevronUp v-else :size="18" class="shrink-0 text-slate-500" aria-hidden="true" />
        </button>
      </div>
      <div :class="isCollapsed ? 'hidden lg:block' : ''">
        <div class="flex items-start gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><Stethoscope :size="20" aria-hidden="true" /></span>
          <div class="min-w-0"><h2 class="text-base font-semibold text-slate-950">{{ facility.name_ko }}</h2><p v-if="formatMedicalFacilityType(facility.facility_name_ko)" class="mt-1 text-sm font-medium text-slate-600">{{ formatMedicalFacilityType(facility.facility_name_ko) }}</p><p class="mt-1 text-sm font-medium text-blue-700">{{ formatDistance(facility.distance_meters) }}</p></div>
        </div>
        <p class="mt-4 flex gap-2 text-sm font-medium" :class="statusClass(facility)"><Clock3 :size="17" class="mt-0.5 shrink-0" aria-hidden="true" /><span>{{ status(facility) }}</span></p>
        <p v-if="facility.phone" class="mt-3 flex gap-2 text-sm leading-5 text-slate-600"><Phone :size="17" class="mt-0.5 shrink-0" aria-hidden="true" /><span>{{ facility.phone }}</span></p>
        <p v-if="facility.address_ko" class="mt-3 flex gap-2 text-sm leading-5 text-slate-500"><MapPin :size="17" class="mt-0.5 shrink-0" aria-hidden="true" /><span>{{ facility.address_ko }}</span></p>
        <p v-if="secondaryText(facility)" class="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{{ secondaryText(facility) }}</p>
        <p class="mt-3 text-xs leading-5 text-slate-500">Hours may differ on public holidays. Hours can change. Call before visiting.</p>
        <div class="mt-5 grid gap-2" :class="facility.phone ? 'sm:grid-cols-2' : ''">
          <a v-if="facility.phone" :href="pharmacyTelHref(facility.phone)" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Phone :size="17" aria-hidden="true" />Call</a>
          <button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="$emit('directions')"><Footprints :size="17" aria-hidden="true" />Directions</button>
        </div>
      </div>
    </template>
    <template v-else>
      <p class="text-sm font-medium text-slate-800">{{ resultCount }} {{ resultCount === 1 ? 'medical facility' : 'medical facilities' }} nearby<span v-if="openCount"> · {{ openCount }} appear open now</span></p>
      <p v-if="!openCount" class="mt-1 text-sm text-slate-500">No nearby medical facility appears open right now. Hours can change. Call before visiting.</p>
      <p v-else class="mt-1 text-sm text-slate-500">Tap a marker to see details.</p>
    </template>
  </section>
</template>
