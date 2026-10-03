<script setup lang="ts">
import { ChevronDown, ChevronUp, Footprints, MapPin, Phone, Siren } from 'lucide-vue-next'
import type { EmergencyFacility } from '~/types/emergency'
import { formatMedicalFacilityType } from '~/utils/medical-facility'
import { pharmacyTelHref } from '~/utils/pharmacy'

const props = defineProps<{ facility: EmergencyFacility | null, resultCount: number, selectionVersion: number, showingNearestFacilities: boolean }>()
defineEmits<{ directions: [] }>()
const isCollapsed = ref(false)

const formatDistance = (kilometers: number) => `${kilometers.toFixed(kilometers < 10 ? 1 : 0)} km away`
const callNumber = (facility: EmergencyFacility) => facility.emergencyPhone ?? facility.phone
const emergencyType = (facility: EmergencyFacility) => formatMedicalFacilityType(facility.facilityTypeKo) ?? 'Emergency medical facility'

watch(() => props.facility?.sourceId, () => { isCollapsed.value = false })
watch(() => props.selectionVersion, () => { isCollapsed.value = false })
</script>

<template>
  <section class="rounded-t-2xl border border-slate-200 bg-white p-5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] lg:rounded-2xl lg:shadow-lg" aria-live="polite">
    <template v-if="facility">
      <div class="mb-3 lg:hidden">
        <span class="mx-auto block h-1 w-9 rounded-full bg-slate-300" aria-hidden="true"></span>
        <button type="button" class="mt-3 flex w-full items-center justify-between gap-3 text-left" :aria-expanded="!isCollapsed" @click="isCollapsed = !isCollapsed">
          <span v-if="isCollapsed" class="min-w-0"><span class="block truncate text-sm font-semibold text-slate-950">{{ facility.nameKo }}</span><span class="mt-0.5 block text-xs font-medium text-slate-600">{{ formatDistance(facility.distanceKm) }}</span></span>
          <span v-else class="text-sm font-medium text-slate-600">Emergency facility details</span>
          <ChevronDown v-if="!isCollapsed" :size="18" class="shrink-0 text-slate-500" aria-hidden="true" /><ChevronUp v-else :size="18" class="shrink-0 text-slate-500" aria-hidden="true" />
        </button>
      </div>
      <div :class="isCollapsed ? 'hidden lg:block' : ''">
        <div class="flex items-start gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-700"><Siren :size="20" aria-hidden="true" /></span>
          <div class="min-w-0"><h2 class="text-base font-semibold text-slate-950">{{ facility.nameKo }}</h2><p class="mt-1 text-sm font-medium text-slate-600">{{ emergencyType(facility) }}</p><p class="mt-1 text-sm font-medium text-blue-700">{{ formatDistance(facility.distanceKm) }}</p></div>
        </div>
        <p v-if="callNumber(facility)" class="mt-4 flex gap-2 text-sm leading-5 text-slate-700"><Phone :size="17" class="mt-0.5 shrink-0" aria-hidden="true" /><span><span class="font-medium">ER phone: </span>{{ callNumber(facility) }}</span></p>
        <p v-if="facility.addressKo" class="mt-3 flex gap-2 text-sm leading-5 text-slate-500"><MapPin :size="17" class="mt-0.5 shrink-0" aria-hidden="true" /><span>{{ facility.addressKo }}</span></p>
        <div class="mt-5 grid gap-2" :class="callNumber(facility) ? 'sm:grid-cols-2' : ''">
          <a v-if="callNumber(facility)" :href="pharmacyTelHref(callNumber(facility)!)" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Phone :size="17" aria-hidden="true" />Call ER</a>
          <button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="$emit('directions')"><Footprints :size="17" aria-hidden="true" />Directions</button>
        </div>
      </div>
    </template>
    <template v-else>
      <template v-if="showingNearestFacilities"><p class="text-sm font-medium text-slate-800">No emergency facilities found within 10 km.</p><p class="mt-1 text-sm text-slate-500">Showing the nearest emergency facilities.</p></template>
      <template v-else><p class="text-sm font-medium text-slate-800">{{ resultCount }} {{ resultCount === 1 ? 'emergency facility' : 'emergency facilities' }} nearby</p><p class="mt-1 text-sm text-slate-500">Tap a marker to see details.</p></template>
    </template>
  </section>
</template>
