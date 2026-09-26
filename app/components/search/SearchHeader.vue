<script setup lang="ts">
import { Search } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()

const submit = () => emit('submit')
</script>

<template>
  <section class="border-b border-slate-100 bg-blue-50/55">
    <div class="mx-auto max-w-7xl px-5 py-9 lg:px-8 lg:py-12">
      <p class="text-sm font-semibold text-blue-700">Travel discovery</p>
      <h1 class="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Search Korea</h1>
      <p class="mt-2 text-[15px] leading-6 text-slate-600">Find places, routes and practical travel help for your trip.</p>
      <form class="mt-6 flex max-w-3xl rounded-2xl bg-white p-1.5 shadow-md shadow-slate-300/25 ring-1 ring-slate-200" @submit.prevent="submit">
        <div class="flex min-w-0 flex-1 items-center px-3">
          <Search :size="21" class="shrink-0 text-slate-400" />
          <input
            :value="props.modelValue"
            type="search"
            placeholder="Search places, routes or guides"
            class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-400"
            @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          >
        </div>
        <button type="submit" class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-6">Search</button>
      </form>
    </div>
  </section>
</template>
