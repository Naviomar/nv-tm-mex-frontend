<template>
  <div
    class="login-page d-flex align-center justify-center"
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
          <div class="text-center mb-10">
            <h1 class="text-h5 font-weight-black mb-2 tracking-normal text-dynamic-title">
              TM México
            </h1>
            <p class="text-body-2 font-weight-medium fade-in-text text-dynamic-subtitle">
              {{ welcomeMessage }}
            </p>
          </div>

          <!-- Paso 2: código de la app autenticadora (o de recuperación) -->
          <div v-if="twoFactor.active">
            <div class="text-center mb-6">
              <v-icon size="36" class="text-dynamic-title">mdi-cellphone-key</v-icon>
              <p class="text-body-2 mt-2 text-dynamic-subtitle">
                {{ twoFactor.useRecovery
                  ? 'Enter one of your recovery codes.'
                  : 'Enter the 6-digit code from your authenticator app.' }}
              </p>
            </div>
            <v-otp-input
              v-if="!twoFactor.useRecovery"
              v-model="twoFactor.code"
              length="6"
              type="number"
              autofocus
              :disabled="loadingStore.loading"
              @finish="submitTwoFactor"
            />
            <v-text-field
              v-else
              v-model="twoFactor.recoveryCode"
              placeholder="xxxxxxxxxx-xxxxxxxxxx"
              prepend-inner-icon="mdi-key-chain-variant"
              variant="outlined"
              class="soft-input"
              rounded="lg"
              autofocus
              hide-details
              @keyup.enter="submitTwoFactor"
            />
            <div v-if="twoFactor.error" class="text-error text-caption mt-2 text-center">{{ twoFactor.error }}</div>
            <v-btn
              block
              height="52"
              class="text-body-2 font-weight-bold rounded-lg elevation-2 custom-btn-hover btn-dynamic mt-6"
              :loading="loadingStore.loading"
              @click="submitTwoFactor"
            >
              Verify
            </v-btn>
            <div class="d-flex justify-space-between mt-4">
              <a class="text-caption font-weight-bold cursor-pointer hover-underline text-dynamic-link" @click="toggleRecovery">
                {{ twoFactor.useRecovery ? 'Use authenticator code' : 'Use a recovery code' }}
              </a>
              <a class="text-caption font-weight-bold cursor-pointer hover-underline text-dynamic-link" @click="resetTwoFactor">
                Back
              </a>
            </div>
          </div>

          <template v-else>
          <form @submit.prevent="handleLogin">
            <div class="mb-6">
              <label class="d-block text-caption font-weight-bold mb-2 pl-1 text-dynamic-label">
                Email Address
              </label>
              <v-text-field
                v-model="email"
                name="email"
                autocomplete="username"
                density="comfortable"
                placeholder="e.g. name@company.com"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                class="soft-input"
                hide-details="auto"
                rounded="lg"
              ></v-text-field>
            </div>

            <div class="mb-8">
              <div class="d-flex justify-space-between align-center mb-2 pl-1">
                <label class="text-caption font-weight-bold text-dynamic-label">
                  Password
                </label>
                <a 
                  class="text-caption font-weight-bold text-decoration-none cursor-pointer hover-underline text-dynamic-link"
                  @click="onClickForgotPassword"
                >
                  Forgot password?
                </a>
              </div>
            
              <v-text-field
                v-model="password"
                name="password"
                autocomplete="current-password"
                :append-inner-icon="visible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                :type="visible ? 'text' : 'password'"
                density="comfortable"
                placeholder="Enter your password"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
                class="soft-input"
                hide-details="auto"
                rounded="lg"
                @click:append-inner="visible = !visible"
              ></v-text-field>
            </div>

            <v-btn 
              block 
              height="52"
              type="submit"
              class="text-body-2 font-weight-bold rounded-lg elevation-2 custom-btn-hover btn-dynamic"
              :loading="loadingStore.loading"
            >
              Sign In
              <v-icon end icon="mdi-arrow-right-circle-outline" class="ml-2"></v-icon>
            </v-btn>
          </form>
          </template>

        </v-card>
      </div>
    </v-slide-y-transition>

  </div>
</template>

<script setup lang="ts">
import { loginSchema } from '~/forms/authSchemas'
import { useField, useForm } from 'vee-validate'

const { isAuthenticated, refreshIdentity } = useSanctumAuth()
const sanctumClient = useSanctumClient()
const router = useRouter()
const route = useRoute()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const apiErrorStore = useApiErrorStore()
const avatarStore = useAvatarStore()
const darkMode = useDarkMode()

const visible = ref(false)
const welcomeMessage = ref('Welcome') 

const { handleSubmit } = useForm({
  validationSchema: loginSchema,
})

const { value: email } = useField('email')
const { value: password } = useField('password')

function onClickForgotPassword() {
  router.push('/system/auth/forgot-password')
}

const twoFactor = reactive({ active: false, useRecovery: false, code: '', recoveryCode: '', error: '' })

// El login se hace a mano (no con login() de nuxt-auth-sanctum) porque con doble factor el backend
// responde { two_factor: true } y la sesión no existe hasta validar el código.
const onSuccess = async (values: any) => {
  try {
    loadingStore.start()
    const response: any = await sanctumClient('/login', { method: 'post', body: values })
    if (response?.two_factor) {
      twoFactor.active = true
      return
    }
    await finishLogin()
  } catch (e: any) {
    console.error(e)
    apiErrorStore.addError(e.response)
  } finally {
    setTimeout(() => { loadingStore.stop() }, 250)
  }
}

async function submitTwoFactor() {
  const body = twoFactor.useRecovery ? { recovery_code: twoFactor.recoveryCode.trim() } : { code: twoFactor.code }
  if (!(body.code?.length === 6 || body.recovery_code)) return
  try {
    loadingStore.start()
    twoFactor.error = ''
    await sanctumClient('/two-factor-challenge', { method: 'post', body })
    await finishLogin()
  } catch (e: any) {
    twoFactor.code = ''
    if (e?.response?.status === 429) {
      twoFactor.error = e?.data?.errors?.email?.[0] || 'Too many attempts. Wait a minute and try again.'
    } else if (e?.response?.status === 422) {
      twoFactor.error = 'Invalid code.'
    } else {
      // La sesión del reto expiró: se vuelve a pedir la contraseña.
      resetTwoFactor()
      apiErrorStore.addError(e.response)
    }
  } finally {
    setTimeout(() => { loadingStore.stop() }, 250)
  }
}

function toggleRecovery() {
  twoFactor.useRecovery = !twoFactor.useRecovery
  twoFactor.error = ''
}

function resetTwoFactor() {
  Object.assign(twoFactor, { active: false, useRecovery: false, code: '', recoveryCode: '', error: '' })
}

async function finishLogin() {
  await refreshIdentity()

  if (import.meta.client) {
    localStorage.setItem('has_logged_in_before', 'true')
  }

  const { user } = useSanctumAuth() as any
  if (user.value?.avatar_config) {
    avatarStore.setInitialValues(user.value.avatar_config)
  }
  snackbar.add({ type: 'success', text: 'Welcome back!' })

  const redirect = route.query.redirect as string
  await navigateTo(redirect && redirect.startsWith('/') ? redirect : '/')
}

function onInvalidSubmit() {
  snackbar.add({ type: 'warning', text: 'Please check your details.' })
}

const handleLogin = handleSubmit(onSuccess, onInvalidSubmit)

onMounted(async () => {
  const hasVisited = localStorage.getItem('has_logged_in_before')
  welcomeMessage.value = hasVisited ? 'Welcome back' : 'Welcome'

  if (isAuthenticated.value) {
    const redirect = route.query.redirect as string
    await router.push(redirect || '/')
  }
})
</script>

<style scoped>
/* --- PALETA DE COLORES INTELIGENTE --- */

/* 1. MODO CLARO */
.theme-light {
    --bg-gradient: linear-gradient(180deg, #F9FAFB 0%, #E5E7EB 100%);
    --card-bg: rgba(255, 255, 255, 0.85);

    /* Variable NUEVA: Borde visible solo en modo claro */
    --card-border: rgba(0,0,0,0.08);

    /* Azul corporativo basado en el logo de Transporte Multimodal */
    --brand-primary: #1C2A7A;

    --text-title: #1C2A7A;
    --text-subtitle: rgba(0, 0, 0, 0.6);
    --text-label: #1C2A7A;
    --input-bg: #F3F4F6;
    --input-focus-bg: #FFFFFF;
    --input-border: rgba(0,0,0,0.08);
    --input-text: #1C2A7A;
    --input-placeholder: #9CA3AF;
    --input-focus-border: var(--brand-primary);
    --link-color: var(--brand-primary);
    --btn-bg: var(--brand-primary);
    --btn-text: #FFFFFF;
    --shadow-color: rgba(0, 0, 0, 0.05);
    --icon-color: #6B7280;
}

/* 2. MODO OSCURO */
.theme-dark {
    /* Misma paleta oscura que chl (navy oscuro, no gris) para que ambos
       sistemas se vean consistentes. */
    --bg-gradient: #05070d;
    --card-bg: rgba(20, 24, 38, 0.72);

    /* Variable NUEVA: Borde transparente (sin marco negro) */
    --card-border: rgba(255, 255, 255, 0.08);

    /* Azul corporativo reutilizado también en modo oscuro */
    --brand-primary: #2196f3;

    --text-title: #FFFFFF;
    --text-subtitle: #B0B0B0;
    --text-label: #E0E0E0;
    --input-bg: #1c2030;
    --input-focus-bg: #232840;
    --input-border: #343a4d;
    --input-text: #FFFFFF;
    --input-placeholder: #909090;
    --input-focus-border: var(--brand-primary);
    --link-color: var(--brand-primary);
    --btn-bg: var(--brand-primary); 
    --btn-text: #FFFFFF;
    --shadow-color: rgba(0, 0, 0, 0.4);
    --icon-color: #B0B0B0;
}

/* --- ESTILOS GENERALES --- */
.login-page {
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

  /* CORREGIDO: Usar variable específica para el borde de tarjeta */
  border: 1px solid var(--card-border);
  backdrop-filter: blur(12px);

  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Textos */
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

/* INPUTS */
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
  box-shadow: 0 0 0 3px rgba(28, 42, 122, 0.25) !important;
}

.soft-input :deep(.v-field--focused .v-field__outline) {
  border-color: var(--input-focus-border) !important; 
}

.soft-input :deep(input) { color: var(--input-text) !important; }
.soft-input :deep(input::placeholder) { color: var(--input-placeholder) !important; opacity: 1; }
.soft-input :deep(.v-icon) { color: var(--icon-color) !important; opacity: 1; transition: color 0.3s; }

/* Animaciones */
.fade-in-text { animation: fadeIn 0.8s ease-in-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.filter-drop-shadow { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
.hover-underline:hover { text-decoration: underline !important; }
.tracking-normal { letter-spacing: -0.025em !important; }
.transition-all { transition: all 0.3s ease; }

.custom-btn-hover:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0, 0.25) !important;
  filter: brightness(1.1);
}
</style>