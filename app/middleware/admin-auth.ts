export default defineNuxtRouteMiddleware(async (to) => {
  const { checkAdmin, getCurrentUser } = useAdminAuth()
  const user = await getCurrentUser()

  if (!user) {
    return navigateTo({
      path: '/admin/login',
      query: { redirect: to.fullPath },
    })
  }

  if (!await checkAdmin()) {
    return navigateTo({
      path: '/admin/login',
      query: {
        error: 'not-authorized',
        redirect: to.fullPath,
      },
    })
  }
})
