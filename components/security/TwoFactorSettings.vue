<template>
  <div>
    <!-- Estado actual -->
    <div class="d-flex align-center flex-wrap ga-2 mb-3">
      <v-chip :color="isOn ? 'success' : 'grey'" variant="tonal" size="small">
        <v-icon start size="16">{{ isOn ? 'mdi-shield-check' : 'mdi-shield-off-outline' }}</v-icon>
        {{ isOn ? 'Two-factor authentication is on' : 'Two-factor authentication is off' }}
      </v-chip>
      <v-chip v-if="required" color="primary" variant="outlined" size="small">Required</v-chip>
    </div>


    <!-- Paso 1: activar -->
    <div v-if="!isOn && step === 'idle'">
      <v-btn color="primary" prepend-icon="mdi-shield-key-outline" :loading="busy" @click="start">
        Set up two-factor authentication
      </v-btn>
    </div>

    <!-- Paso 2: escanear y confirmar -->
    <div v-if="step === 'scan'" class="tm-panel tm-border rounded-lg pa-4">
      <div class="text-subtitle-2 mb-2">1. Scan with your authenticator app</div>
      <div class="d-flex flex-wrap ga-6 align-center mb-4">
        <!-- El SVG lo genera el backend (sin servicios externos) -->
        <div class="qr-box pa-2 rounded" v-html="qrSvg" />
        <div class="text-body-2">
          <div class="text-medium-emphasis mb-1">Or enter this key:</div>
          <code class="text-body-1 font-weight-bold">{{ secretKey }}</code>
        </div>
      </div>
      <div class="text-subtitle-2 mb-2">2. Enter the 6-digit code</div>
      <div class="d-flex ga-2 align-start" style="max-width: 360px">
        <v-otp-input v-model="code" length="6" type="number" :disabled="busy" @finish="confirm" />
      </div>
      <div v-if="codeError" class="text-error text-caption mb-2">{{ codeError }}</div>
      <div class="d-flex ga-2 mt-2">
        <v-btn color="primary" :loading="busy" :disabled="code.length !== 6" @click="confirm">Confirm</v-btn>
        <v-btn variant="text" :disabled="busy" @click="cancelSetup">Cancel</v-btn>
      </div>
    </div>

    <!-- Paso 3: códigos de recuperación -->
    <div v-if="recoveryCodes.length" class="tm-highlight-warning rounded-lg pa-4 mt-4">
      <div class="text-subtitle-2 mb-1">
        <v-icon size="18" class="mr-1">mdi-key-chain-variant</v-icon>Save your recovery codes
      </div>
      <div class="text-caption mb-3">Each code works once if you lose your phone.</div>
      <div class="recovery-grid mb-3">
        <code v-for="c in recoveryCodes" :key="c">{{ c }}</code>
      </div>
      <div class="d-flex ga-2">
        <v-btn size="small" variant="outlined" prepend-icon="mdi-content-copy" @click="copyCodes">Copy</v-btn>
        <v-btn size="small" color="primary" variant="flat" @click="acknowledgeCodes">I saved them</v-btn>
      </div>
    </div>

    <!-- Activo: administrar -->
    <div v-if="isOn && step === 'idle' && !recoveryCodes.length" class="d-flex flex-wrap ga-2 mt-2">
      <v-btn variant="outlined" prepend-icon="mdi-key-chain-variant" :loading="busy" @click="showCodes(false)">Show recovery codes</v-btn>
      <v-btn variant="outlined" prepend-icon="mdi-refresh" :loading="busy" @click="showCodes(true)">New recovery codes</v-btn>
      <v-btn
        v-if="!required"
        variant="outlined"
        color="error"
        prepend-icon="mdi-shield-off-outline"
        :loading="busy"
        @click="disable"
      >
        Turn off
      </v-btn>
    </div>

    <!-- Reconfirmar contraseña (Fortify la pide para activar/desactivar) -->
    <v-dialog v-model="passwordDialog.show" max-width="420" persistent>
      <v-card>
        <v-card-title>Confirm your password</v-card-title>
        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-3">For your security, confirm your password to continue.</div>
          <v-text-field
            v-model="passwordDialog.password"
            type="password"
            label="Password"
            variant="outlined"
            density="comfortable"
            autofocus
            :error-messages="passwordDialog.error ? [passwordDialog.error] : []"
            @keyup.enter="submitPassword"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closePasswordDialog(false)">Cancel</v-btn>
          <v-btn color="primary" :loading="passwordDialog.saving" @click="submitPassword">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ enabled: boolean; required?: boolean }>()
// changed: el estado del 2FA cambió; done: el usuario ya guardó sus códigos y puede continuar.
const emit = defineEmits<{ (e: 'changed'): void; (e: 'done'): void }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const step = ref<'idle' | 'scan'>('idle')
// Recién confirmado: el padre puede tardar en recargar el estado (o no hacerlo, en la pantalla obligatoria).
const justEnabled = ref(false)
const justDisabled = ref(false)
const isOn = computed(() => (props.enabled || justEnabled.value) && !justDisabled.value)
watch(() => props.enabled, () => {
  justEnabled.value = false
  justDisabled.value = false
})
const busy = ref(false)
const qrSvg = ref('')
const secretKey = ref('')
const code = ref('')
const codeError = ref('')
const recoveryCodes = ref<string[]>([])
const passwordDialog = reactive({ show: false, password: '', error: '', saving: false, resolve: null as null | ((ok: boolean) => void) })

const quiet = { onResponseError: () => {} }

/**
 * Ejecuta una llamada que Fortify protege con reconfirmación de contraseña (423): si la pide,
 * abre el diálogo y reintenta una vez confirmada.
 */
async function withPasswordConfirm<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (e: any) {
    if (e?.response?.status !== 423 && e?.status !== 423) throw e
    const ok = await new Promise<boolean>((resolve) => {
      passwordDialog.password = ''
      passwordDialog.error = ''
      passwordDialog.resolve = resolve
      passwordDialog.show = true
    })
    return ok ? await fn() : null
  }
}

// Tiene su propio estado de carga: la acción que abrió el diálogo sigue en curso (busy) mientras espera.
async function submitPassword() {
  passwordDialog.saving = true
  try {
    await $api.accountSecurity.confirmPassword(passwordDialog.password, quiet)
    closePasswordDialog(true)
  } catch (e: any) {
    passwordDialog.error = e?.data?.errors?.password?.[0] || e?.data?.message || 'Incorrect password'
  } finally {
    passwordDialog.saving = false
  }
}

function closePasswordDialog(ok: boolean) {
  passwordDialog.show = false
  passwordDialog.resolve?.(ok)
  passwordDialog.resolve = null
}

async function start() {
  busy.value = true
  try {
    const started = await withPasswordConfirm(() => $api.accountSecurity.enableTwoFactor(quiet))
    if (started === null) return
    const [qr, key]: any[] = await Promise.all([$api.accountSecurity.twoFactorQrCode(), $api.accountSecurity.twoFactorSecretKey()])
    qrSvg.value = qr?.svg ?? ''
    secretKey.value = key?.secretKey ?? ''
    code.value = ''
    codeError.value = ''
    step.value = 'scan'
  } catch (e: any) {
    snackbar.add({ type: 'error', text: e?.data?.message || 'Two-factor authentication could not be started' })
  } finally {
    busy.value = false
  }
}

async function confirm() {
  if (code.value.length !== 6 || busy.value) return
  busy.value = true
  codeError.value = ''
  try {
    await $api.accountSecurity.confirmTwoFactor(code.value, quiet)
    const codes: any = await $api.accountSecurity.recoveryCodes()
    recoveryCodes.value = Array.isArray(codes) ? codes : []
    step.value = 'idle'
    justEnabled.value = true
    justDisabled.value = false
    snackbar.add({ type: 'success', text: 'Two-factor authentication is on' })
    emit('changed')
  } catch (e: any) {
    codeError.value = e?.data?.errors?.code?.[0] || 'Invalid code, try again with the current one'
    code.value = ''
  } finally {
    busy.value = false
  }
}

async function cancelSetup() {
  busy.value = true
  try {
    // El secreto quedó guardado sin confirmar: se borra para no dejar un 2FA a medias.
    await withPasswordConfirm(() => $api.accountSecurity.disableTwoFactor(quiet))
  } finally {
    step.value = 'idle'
    busy.value = false
  }
}

async function showCodes(regenerate: boolean) {
  busy.value = true
  try {
    const result = await withPasswordConfirm(async () => {
      if (regenerate) await $api.accountSecurity.regenerateRecoveryCodes(quiet)
      return await $api.accountSecurity.recoveryCodes(quiet)
    })
    if (result) recoveryCodes.value = result as string[]
  } catch (e: any) {
    snackbar.add({ type: 'error', text: e?.data?.message || 'Recovery codes could not be loaded' })
  } finally {
    busy.value = false
  }
}

async function disable() {
  busy.value = true
  try {
    const result = await withPasswordConfirm(async () => {
      await $api.accountSecurity.disableTwoFactor(quiet)
      return true
    })
    if (result) {
      justEnabled.value = false
      justDisabled.value = true
      snackbar.add({ type: 'success', text: 'Two-factor authentication is off' })
      emit('changed')
    }
  } catch (e: any) {
    snackbar.add({ type: 'error', text: e?.data?.message || 'Two-factor authentication could not be turned off' })
  } finally {
    busy.value = false
  }
}

function acknowledgeCodes() {
  recoveryCodes.value = []
  emit('done')
}

async function copyCodes() {
  try {
    await navigator.clipboard.writeText(recoveryCodes.value.join('\n'))
    snackbar.add({ type: 'success', text: 'Recovery codes copied' })
  } catch {
    snackbar.add({ type: 'warning', text: 'Copy them manually' })
  }
}
</script>

<style scoped>
.qr-box {
  background: #fff; /* el QR necesita fondo claro para leerse también en modo oscuro */
  line-height: 0;
}
.recovery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 6px;
}
</style>
