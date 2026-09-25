<script setup lang="ts">
const route = useRoute()
const { checkAdmin, getCurrentUser, signIn } = useAdminAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref(
  route.query.error === 'not-authorized'
    ? 'Your account is not authorized to access Locorea Admin.'
    : '',
)

const redirectPath = computed(() => {
  const redirect = route.query.redirect

  if (typeof redirect === 'string'
    && redirect.startsWith('/admin')
    && redirect !== '/admin/login') {
    return redirect
  }

  return '/admin'
})

const submit = async () => {
  errorMessage.value = ''
  loading.value = true

  const result = await signIn(email.value.trim(), password.value)

  loading.value = false

  if (!result.success) {
    errorMessage.value = result.reason === 'not-authorized'
      ? 'Your account is not authorized to access Locorea Admin.'
      : 'Email or password is incorrect.'
    return
  }

  await navigateTo(redirectPath.value)
}

onMounted(async () => {
  const user = await getCurrentUser()

  if (user && await checkAdmin()) {
    await navigateTo(redirectPath.value)
  }
})

useSeoMeta({ title: 'Locorea Admin Sign in' })
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
    <section class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <NuxtLink to="/" class="text-sm font-medium text-blue-600 hover:text-blue-700">← Back to Locorea</NuxtLink>
      <h1 class="mt-6 text-2xl font-semibold tracking-tight text-slate-950">Locorea Admin</h1>
      <p class="mt-2 text-sm leading-6 text-slate-500">Sign in to manage Locorea content.</p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <div><label for="email" class="text-sm font-medium text-slate-700">Email</label><input id="email" v-model="email" type="email" autocomplete="email" required class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"></div>
        <div><label for="password" class="text-sm font-medium text-slate-700">Password</label><input id="password" v-model="password" type="password" autocomplete="current-password" required class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"></div>
        <p v-if="errorMessage" class="rounded-lg bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700" role="alert">{{ errorMessage }}</p>
        <button type="submit" :disabled="loading" class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
      </form>
    </section>
  </main>
</template>
