<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  headingId?: string
}>()
</script>

<template>
  <div>
    <p class="text-[15px] font-semibold leading-5 text-blue-700 sm:text-base sm:leading-6 lg:text-[19px] lg:leading-6">{{ eyebrow }}</p>
    <h2 :id="headingId" class="mt-2 text-[24px] font-bold leading-7 tracking-tight text-slate-950 sm:text-3xl sm:leading-9 lg:text-[34px] lg:leading-10">{{ title }}</h2>
  </div>
</template>
