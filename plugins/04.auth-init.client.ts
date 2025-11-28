export default defineNuxtPlugin(() => {
  const { user } = useSanctumAuth()
  const avatarStore = useAvatarStore()

  if (user.value && user.value.avatar_config) {
    // console.log('Setting initial avatar values', user.value.avatar_config)
    avatarStore.setInitialValues(user.value.avatar_config)
  }
})
