<script setup lang="ts">
import { Menu } from 'lucide-vue-next'

const { signOut } = useAdminAuth()
const signingOut = ref(false)

const handleSignOut = async () => {
  signingOut.value = true
  await signOut()
  await navigateTo('/admin/login')
  signingOut.value = false
}

defineProps<{
  title: string
  description: string
}>()

defineEmits<{
  menu: []
}>()
</script>

<template>
  <header class="flex min-h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
    <button
      type="button"
      class="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:hidden"
      aria-label="Open admin navigation"
      @click="$emit('menu')"
    >
      <Menu :size="20" />
    </button>
    <div class="min-w-0">
      <h1 class="text-lg font-semibold tracking-tight text-slate-950">{{ title }}</h1>
      <p class="text-sm text-slate-500">{{ description }}</p>
    </div>
    <button type="button" :disabled="signingOut" class="ml-auto rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" @click="handleSignOut">{{ signingOut ? 'Signing out…' : 'Sign out' }}</button>
  </header>
</template>
