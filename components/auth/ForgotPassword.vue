<template>
  <section class="">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" class="flex items-center mb-6 text-2xl font-semibold">
        <img class="h-14 mr-2" :src="darkMode.isDark ? '/tm-logo.png' : '/tm-logo-black.png'" alt="TM" />
        Tranporte Multimodal
      </a>
      <div
        class="w-full p-6 bg-white rounded-lg shadow-sm dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8"
      >
        <h2 class="mb-1 text-xl font-bold leading-tight tracking-tight md:text-2xl">Forgot your password?</h2>

        <div class="mb-2">
          <label for="email" class="block mb-2 text-sm font-medium">Your email address</label>
          <v-text-field v-model="user.email" type="email" placeholder="name@company.com" />
        </div>
        <button
          @click="sendEmail"
          class="w-full text-white bg-primary focus:ring-4 focus:outline-hidden focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Send email
        </button>
        <div class="flex items-start pt-4">
          <div class="text-sm">
            <v-btn size="small" variant="outlined" to="/system/auth/login">Back</v-btn>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const router = useRouter()
const darkMode = useDarkMode()

const user = ref({
  email: '',
})

const sendEmail = async () => {
  try {
    if (!user.value.email) {
      console.log('snackbar show')
      snackbar.add({ type: 'error', text: 'Please enter your email' })
      return
    }
    loadingStore.start()
    const res = await $api.users.forgotPassword({ email: user.value.email })
    snackbar.add({
      type: 'success',
      text: `Email sent to ${user.value.email}`,
    })
    router.push(`/system/auth/login`)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
