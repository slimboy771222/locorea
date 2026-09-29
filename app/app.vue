<script setup lang="ts">
useHead({
  link: [
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png?v=2' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png?v=2' },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=2' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=2' },
    { rel: 'manifest', href: '/site.webmanifest?v=2' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
