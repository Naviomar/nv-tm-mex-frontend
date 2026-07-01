export default defineNuxtPlugin(() => {
  const { isAuthenticated } = useSanctumAuth()
  const route = useRoute()

  watch(isAuthenticated, (newValue) => {
    if (newValue === false && route.meta?.sanctum?.excluded !== true) {
      navigateTo('/system/auth/login', { replace: true })
    }
  })
})
