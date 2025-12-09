<template>
  <div 
    class="login-page d-flex align-center justify-center"
    :class="darkMode.isDark ? 'theme-dark' : 'theme-light'"
  >
    
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

          <div class="mb-6">
            <label class="d-block text-caption font-weight-bold mb-2 pl-1 text-dynamic-label">
              Email Address
            </label>
            <v-text-field
              v-model="email"
              name="email"
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
              @keyup.enter="handleLogin"
            ></v-text-field>
          </div>

          <v-btn 
            block 
            height="52"
            class="text-body-2 font-weight-bold rounded-lg elevation-2 custom-btn-hover btn-dynamic"
            :loading="loadingStore.loading"
            @click="handleLogin"
          > 
            Sign In
            <v-icon end icon="mdi-arrow-right-circle-outline" class="ml-2"></v-icon>
          </v-btn>

        </v-card>
      </div>
    </v-slide-y-transition>

  </div>
</template>

<script setup lang="ts">
import { loginSchema } from '~/forms/authSchemas'
import { useField, useForm } from 'vee-validate'

const { login, isAuthenticated } = useSanctumAuth()
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

const onSuccess = async (values: any) => {
  try {
    loadingStore.start()
    await login(values)
    
    if (import.meta.client) {
        localStorage.setItem('has_logged_in_before', 'true')
    }

    const { user } = useSanctumAuth() as any
    if (user.value?.avatar_config) {
      avatarStore.setInitialValues(user.value.avatar_config)
    }
    snackbar.add({ type: 'success', text: 'Welcome back!' })
  } catch (e: any) {
    console.error(e)
    apiErrorStore.addError(e.response)
  } finally {
    setTimeout(() => { loadingStore.stop() }, 250)
  }
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
    --card-bg: #FFFFFF;
    
    /* Variable NUEVA: Borde visible solo en modo claro */
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
    --bg-gradient: #1E1E1E; 
    --card-bg: #2D2D2D; 
    
    /* Variable NUEVA: Borde transparente (sin marco negro) */
    --card-border: transparent;

    --text-title: #FFFFFF;
    --text-subtitle: #B0B0B0;
    --text-label: #E0E0E0;
    --input-bg: #383838; 
    --input-focus-bg: #404040;
    --input-border: #4D4D4D;
    --input-text: #FFFFFF;
    --input-placeholder: #909090;
    --input-focus-border: #2196F3;
    --link-color: #64B5F6;
    --btn-bg: #1976D2; 
    --btn-text: #FFFFFF;
    --shadow-color: rgba(0, 0, 0, 0.4);
    --icon-color: #B0B0B0;
}

/* --- ESTILOS GENERALES --- */
.login-page {
  min-height: 100vh;
  width: 100%;
  background: var(--bg-gradient);
  transition: background 0.5s ease;
}

.width-container {
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
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2) !important;
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