export default defineNuxtPlugin((nuxtApp) => {
  const modules = useApiFactory()

  return {
    provide: {
      api: modules,
    },
  }
})
