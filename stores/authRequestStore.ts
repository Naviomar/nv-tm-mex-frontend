export const useAuthRequestStore = defineStore('authRequest', () => {
  const authRequest = ref<any>(null)

  const setAuthRequest = (value: any) => {
    authRequest.value = value
  }
  return {
    authRequest,
    setAuthRequest,
  }
})
