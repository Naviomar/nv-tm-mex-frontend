<template>
  <div
    class="auth-page d-flex align-center justify-center"
    :class="darkMode.isDark ? 'theme-dark' : 'theme-light'"
  >
    <AuthGlobeBackground />

    <v-slide-y-transition appear>
      <div class="width-container">

        <div class="text-center mb-8">
           <v-img
            class="mx-auto filter-drop-shadow transition-all"
            max-width="180"
            :src="darkMode.isDark ? '/logo-transporte-multimodal-white.webp' : '/logo-transporte-multimodal.webp'"
            alt="Logo TM"
          ></v-img>
        </div>

        <v-card
          class="mx-auto pa-10 rounded-xl custom-card-transition"
          max-width="450"
          elevation="0"
        >
          <div class="text-center mb-8">
            <h2 class="text-h5 font-weight-black mb-2 tracking-normal text-dynamic-title">
              Reset your password
            </h2>
            <p class="text-body-2 font-weight-medium text-dynamic-subtitle">
              Enter your email and choose a new password below.
            </p>
          </div>

          <div class="mb-6">
            <label class="d-block text-caption font-weight-bold mb-2 pl-1 text-dynamic-label">
              Your email address
            </label>
            <v-text-field
              v-model="form.email"
              type="email"
              placeholder="name@company.com"
              prepend-inner-icon="mdi-email-outline"
              density="comfortable"
              variant="outlined"
              class="soft-input"
              hide-details="auto"
              rounded="lg"
              @keyup.enter="resetPw"
            ></v-text-field>
          </div>

          <div class="mb-6">
            <label class="d-block text-caption font-weight-bold mb-2 pl-1 text-dynamic-label">
              New password
            </label>
            <v-text-field
              v-model="form.password"
              :type="visible ? 'text' : 'password'"
              :append-inner-icon="visible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              placeholder="Enter your new password"
              prepend-inner-icon="mdi-lock-outline"
              density="comfortable"
              variant="outlined"
              class="soft-input"
              hide-details="auto"
              rounded="lg"
              @click:append-inner="visible = !visible"
              @keyup.enter="resetPw"
            ></v-text-field>
          </div>

          <div class="mb-6">
            <label class="d-block text-caption font-weight-bold mb-2 pl-1 text-dynamic-label">
              Confirm password
            </label>
            <v-text-field
              v-model="form.confirm_password"
              :type="visibleConfirm ? 'text' : 'password'"
              :append-inner-icon="visibleConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              placeholder="Re-enter your new password"
              prepend-inner-icon="mdi-lock-check-outline"
              density="comfortable"
              variant="outlined"
              class="soft-input"
              hide-details="auto"
              rounded="lg"
              @click:append-inner="visibleConfirm = !visibleConfirm"
              @keyup.enter="resetPw"
            ></v-text-field>
          </div>

          <v-btn
            block
            height="52"
            class="text-body-2 font-weight-bold rounded-lg elevation-2 custom-btn-hover btn-dynamic mb-6"
            :loading="loadingStore.loading"
            @click="resetPw"
          >
            Reset Password
            <v-icon end icon="mdi-lock-reset" class="ml-2"></v-icon>
          </v-btn>

          <div class="text-center">
            <NuxtLink
              to="/system/auth/login"
              class="text-caption font-weight-bold text-decoration-none cursor-pointer hover-scale text-dynamic-link d-inline-flex align-center"
            >
              <v-icon start icon="mdi-arrow-left" size="small" class="mr-1"></v-icon>
              Back to Login
            </NuxtLink>
          </div>

        </v-card>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const darkMode = useDarkMode()

const visible = ref(false)
const visibleConfirm = ref(false)

const form = ref({
  email: '',
  password: '',
  confirm_password: '',
})

const token = route.query.token as string

const resetPw = async () => {
  try {
    if (!form.value.email || !form.value.password || !form.value.confirm_password) {
      snackbar.add({ type: 'warning', text: 'Please fill in all fields' })
      return
    }

    if (form.value.password !== form.value.confirm_password) {
      snackbar.add({ type: 'warning', text: 'Passwords do not match' })
      return
    }

    if (form.value.password.length < 8) {
      snackbar.add({ type: 'warning', text: 'Password must be at least 8 characters' })
      return
    }

    if (!token) {
      snackbar.add({ type: 'error', text: 'Invalid or missing reset token. Please use the link from your email.' })
      return
    }

    loadingStore.start()
    const body = {
      token: token,
      email: form.value.email,
      password: form.value.password,
      password_confirmation: form.value.confirm_password,
    }
    await $api.users.resetPassword(body)
    snackbar.add({
      type: 'success',
      text: 'Password reset successful',
    })
    setTimeout(() => {
      router.push(`/system/auth/login`)
    }, 1500)
  } catch (e: any) {
    console.error(e)
    const msg = e?.response?._data?.message || 'Something went wrong. Please try again.'
    snackbar.add({ type: 'error', text: msg })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>

<style scoped>
/* --- SISTEMA DE DISEÑO UNIFICADO --- */

/* 1. MODO CLARO */
.theme-light {
    --bg-gradient: linear-gradient(180deg, #F9FAFB 0%, #E5E7EB 100%);
    --card-bg: rgba(255, 255, 255, 0.85);
    --card-border: rgba(0,0,0,0.08);

    --text-title: #000000;
    --text-subtitle: rgba(0, 0, 0, 0.6);
    --text-label: #111827;
    --input-bg: #F3F4F6;
    --input-focus-bg: #FFFFFF;
    --input-border: rgba(0,0,0,0.08);
    --input-text: #111827;
    --input-placeholder: #9CA3AF;
    --input-focus-border: #2E4053;
    --link-color: #1565C0;
    --btn-bg: #2E4053;
    --btn-text: #FFFFFF;
    --shadow-color: rgba(0, 0, 0, 0.05);
    --icon-color: #6B7280;
}

/* 2. MODO OSCURO */
.theme-dark {
    --bg-gradient: #05070d;
    --card-bg: rgba(20, 24, 38, 0.72);

    --card-border: rgba(255, 255, 255, 0.08);

    --text-title: #FFFFFF;
    --text-subtitle: #B0B0B0;
    --text-label: #E0E0E0;
    --input-bg: #1c2030;
    --input-focus-bg: #232840;
    --input-border: #343a4d;
    --input-text: #FFFFFF;
    --input-placeholder: #909090;
    --input-focus-border: #2196F3;
    --link-color: #64B5F6;
    --btn-bg: #2196f3;
    --btn-text: #FFFFFF;
    --shadow-color: rgba(0, 0, 0, 0.4);
    --icon-color: #B0B0B0;
}

/* --- CLASES --- */
.auth-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

.width-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
}

/* Tarjeta */
.custom-card-transition {
  background-color: var(--card-bg) !important;
  color: var(--text-title);
  box-shadow: 0 20px 25px -5px var(--shadow-color),
              0 10px 10px -5px var(--shadow-color) !important;

  border: 1px solid var(--card-border);
  backdrop-filter: blur(12px);

  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Tipografía */
.text-dynamic-title { color: var(--text-title); transition: color 0.3s; }
.text-dynamic-subtitle { color: var(--text-subtitle); transition: color 0.3s; }
.text-dynamic-label { color: var(--text-label); transition: color 0.3s; }
.text-dynamic-link { color: var(--link-color) !important; transition: color 0.3s; }

/* Botón */
.btn-dynamic {
    background-color: var(--btn-bg) !important;
    color: var(--btn-text) !important;
    transition: all 0.3s ease;
}

/* Inputs */
.soft-input :deep(.v-field) {
  background-color: var(--input-bg) !important;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  color: var(--input-text) !important;
}

.soft-input :deep(.v-field__outline) {
  --v-field-border-opacity: 1;
  border-color: var(--input-border) !important;
}

.soft-input :deep(.v-field--focused) {
  background-color: var(--input-focus-bg) !important;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2) !important;
}

.soft-input :deep(.v-field--focused .v-field__outline) {
  border-color: var(--input-focus-border) !important;
}

.soft-input :deep(input) { color: var(--input-text) !important; }
.soft-input :deep(input::placeholder) { color: var(--input-placeholder) !important; opacity: 1; }
.soft-input :deep(.v-icon) { color: var(--icon-color) !important; opacity: 1; transition: color 0.3s; }

/* Efectos */
.filter-drop-shadow { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
.tracking-normal { letter-spacing: -0.025em !important; }
.transition-all { transition: all 0.3s ease; }

.custom-btn-hover:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0, 0.25) !important;
  filter: brightness(1.1);
}

.hover-scale { transition: transform 0.2s ease; }
.hover-scale:hover { transform: translateX(-3px); }
</style>
