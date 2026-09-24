<script setup lang="ts">
const route = useRoute()

const query = computed(() => {
  return String(route.query.q || '')
})
</script>

<template>
  <div>
    <AppHeader />

    <main class="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <p class="text-sm text-slate-500">
        Search
      </p>

      <h1 class="mt-2 text-3xl font-bold">
        Results for "{{ query }}"
      </h1>

      <p class="mt-5 text-slate-500">
        Search implementation is coming next.
      </p>
    </main>
  </div>
</template>