<template>
  <div>
    <v-img class="mx-auto my-6" max-width="350" :src="darkMode.isDark ? '/tm-logo.png' : '/tm-logo-black.png'" />

    <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="448" rounded-sm="lg">
      <div class="text-lg font-bold text-medium-emphasis">{{ appName }}</div>

      <div class="text-subtitle-1 text-medium-emphasis">Account</div>
      <InputText
        name="email"
        density="compact"
        placeholder="Email address"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
      />

      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        Password

        <div
          class="text-caption text-decoration-none text-blue cursor-pointer"
          rel="noopener noreferrer"
          @click="onClickForgotPassword"
        >
          Forgot login password?
        </div>
      </div>
      <InputText
        name="password"
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'"
        density="compact"
        placeholder="Enter your password"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        @click:append-inner="visible = visible!"
        @keyup.enter="handleLogin"
      />

      <v-card v-if="false" class="mb-12" color="surface-variant" variant="tonal">
        <v-card-text class="text-medium-emphasis text-caption">
          Warning: After 3 consecutive failed login attempts, you account will be temporarily locked for three hours. If
          you must login now, you can also click "Forgot login password?" below to reset the login password.
        </v-card-text>
      </v-card>

      <v-btn block class="mb-8" color="blue" size="large" variant="tonal" @click="handleLogin"> Log In </v-btn>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { loginSchema } from '~/forms/authSchemas'
const { login, refreshIdentity, isAuthenticated } = useSanctumAuth()
const { $api } = useNuxtApp()
const router = useRouter()
const route = useRoute()
const runtime = useRuntimeConfig()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const apiErrorStore = useApiErrorStore()
const appName = computed(() => runtime.public.appName)
const visible = ref(false)
const darkMode = useDarkMode()
const avatarStore = useAvatarStore()

const { handleSubmit, values, errors, meta, setValues } = useForm({
  validationSchema: loginSchema,
})

function onClickForgotPassword() {
  router.push('/system/auth/forgot-password')
}

const onSuccess = async () => {
  try {
    loadingStore.start()
    await login(values)

    const { user } = useSanctumAuth() as any
    if (user.value && user.value.avatar_config) {
      avatarStore.setInitialValues(user.value.avatar_config)
    }

    snackbar.add({
      type: 'success',
      text: 'Welcome back!',
    })
  } catch (e: any) {
    console.error(e)
    apiErrorStore.addError(e.response)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'warning', text: 'Please check the form for errors' })
}

const handleLogin = handleSubmit(onSuccess, onInvalidSubmit)

onMounted(async () => {
  try {
    // const response = await $api.users.debugAuth()
    // console.log('debug auth: ', response)
    // await refreshIdentity()
    if (isAuthenticated.value) {
      if (route.query.redirect) {
        console.log('redirecting', route.query.redirect)
        await router.push(route.query.redirect as string)
      } else {
        await router.push('/')
      }
    }
  } catch (e) {
    console.error(e)
  }
})
</script>
