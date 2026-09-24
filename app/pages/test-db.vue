<script setup lang="ts">
const supabase = useSupabase()

const { data: places, error } = await useAsyncData(
  'test-places',
  async () => {
    const { data, error } = await supabase
      .from('places')
      .select(`
        id,
        slug,
        place_type,
        status,
        place_translations (
          language_code,
          name,
          summary
        )
      `)
      .eq('status', 'published')

    if (error) {
      throw error
    }

    return data
  },
)
</script>

<template>
  <main>
    <h1>Locorea DB Test</h1>

    <p v-if="error">
      Failed to load data.
    </p>

    <pre v-else>{{ places }}</pre>
  </main>
</template>