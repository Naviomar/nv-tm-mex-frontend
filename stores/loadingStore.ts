export const useLoadingStore = defineStore('loading', () => {
  const loading = ref(false)
  const start = () => {
    loading.value = true
  }
  // const stop = _Debounce(() => {
  //   loading.value = false
  // }, 250)

  const stop = () => {
    loading.value = false
  }

  return {
    loading,
    start,
    stop,
  }
})
