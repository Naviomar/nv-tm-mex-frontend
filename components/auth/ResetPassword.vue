<template>
  <section class="bg-gray-50">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900">
        <img class="h-14 mr-2" src="/tm-logo-black.png" alt="TM" />
        Tranporte Multimodal
      </a>
      <div
        class="w-full p-6 bg-white rounded-lg shadow-sm dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8"
      >
        <h2 class="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
          Reset your password
        </h2>

        <div class="mb-2">
          <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Your email address</label>
          <input
            type="email"
            name="email"
            id="email"
            class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            placeholder="name@company.com"
            v-model="form.email"
          />
        </div>
        <div class="mb-2">
          <label for="password" class="block mb-2 text-sm font-medium text-gray-900">New password</label>
          <input
            type="password"
            name="password"
            class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            v-model="form.password"
          />
        </div>
        <div class="mb-2">
          <label for="confirm_password" class="block mb-2 text-sm font-medium text-gray-900">Confirm password</label>
          <input
            type="password"
            name="confirm_password"
            class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            v-model="form.confirm_password"
          />
        </div>

        <button
          @click="resetPw"
          class="w-full text-white bg-primary focus:ring-4 focus:outline-hidden focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Reset Password
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
const route = useRoute()
const form = ref({
  email: '',
  password: '',
  confirm_password: '',
})

const token = route.query.token

const resetPw = async () => {
  try {
    if (!form.value.email || !form.value.password || !form.value.confirm_password) {
      snackbar.add({ type: 'error', text: 'Please enter your email, password and password confirmation' })
      return
    }
    loadingStore.start()
    const body = {
      token: token,
      email: form.value.email,
      password: form.value.password,
      password_confirmation: form.value.confirm_password,
    }
    const res = await $api.users.resetPassword(body)
    snackbar.add({
      type: 'success',
      text: `Password reset successful`,
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
