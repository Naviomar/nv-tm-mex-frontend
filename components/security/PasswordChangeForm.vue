<template>
  <div>
    <v-text-field
      v-model="form.current_password"
      label="Current password"
      :type="show ? 'text' : 'password'"
      density="comfortable"
      variant="outlined"
      prepend-inner-icon="mdi-lock-outline"
      autocomplete="current-password"
      :error-messages="errors.current_password"
      class="mb-2"
    />
    <v-text-field
      v-model="form.password"
      label="New password"
      :type="show ? 'text' : 'password'"
      density="comfortable"
      variant="outlined"
      prepend-inner-icon="mdi-lock-plus-outline"
      :append-inner-icon="show ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
      autocomplete="new-password"
      :error-messages="errors.password"
      class="mb-2"
      @click:append-inner="show = !show"
    />
    <v-text-field
      v-model="form.password_confirmation"
      label="Confirm new password"
      :type="show ? 'text' : 'password'"
      density="comfortable"
      variant="outlined"
      prepend-inner-icon="mdi-lock-check-outline"
      autocomplete="new-password"
      :error-messages="mismatch ? ['Passwords do not match.'] : []"
      class="mb-2"
      @keyup.enter="submit"
    />

    <div class="tm-panel tm-border rounded-lg pa-3 mb-4">
            <div v-for="rule in rules" :key="rule.label" class="d-flex align-center text-caption">
        <v-icon size="16" :color="rule.ok ? 'success' : 'grey'" class="mr-1">
          {{ rule.ok ? 'mdi-check-circle' : 'mdi-circle-outline' }}
        </v-icon>
        <span :class="rule.ok ? 'text-success' : 'text-medium-emphasis'">{{ rule.label }}</span>
      </div>
      <div v-if="policy.history" class="d-flex align-center text-caption text-medium-emphasis">
        <v-icon size="16" color="grey" class="mr-1">mdi-history</v-icon>
        Not one of your last {{ policy.history }}
      </div>
    </div>

    <v-btn color="primary" block :loading="saving" :disabled="!valid" @click="submit">
      {{ submitLabel }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ submitLabel?: string }>(), { submitLabel: 'Change password' })
const emit = defineEmits<{ (e: 'changed', status: any): void }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const form = reactive({ current_password: '', password: '', password_confirmation: '' })
const errors = ref<Record<string, string[]>>({})
const show = ref(false)
const saving = ref(false)
const policy = ref({ min_length: 8, history: 5 })

onMounted(async () => {
  try {
    const status: any = await $api.accountSecurity.status()
    if (status?.password_policy) policy.value = status.password_policy
  } catch {
    // las reglas por defecto bastan para guiar; el backend valida igual
  }
})

const rules = computed(() => {
  const p = form.password
  return [
    { label: `At least ${policy.value.min_length} characters`, ok: p.length >= policy.value.min_length },
    { label: 'Upper and lower case letters', ok: /[a-z]/.test(p) && /[A-Z]/.test(p) },
    { label: 'At least one number', ok: /\d/.test(p) },
    { label: 'At least one symbol', ok: /[^A-Za-z0-9]/.test(p) },
  ]
})

const mismatch = computed(() => form.password_confirmation.length > 0 && form.password !== form.password_confirmation)
const valid = computed(() => !!form.current_password && rules.value.every((r) => r.ok) && form.password === form.password_confirmation)

async function submit() {
  if (!valid.value || saving.value) return
  saving.value = true
  errors.value = {}
  try {
    const res: any = await $api.accountSecurity.changePassword({ ...form }, { onResponseError: () => {} })
    snackbar.add({ type: 'success', text: 'Password updated' })
    form.current_password = ''
    form.password = ''
    form.password_confirmation = ''
    emit('changed', res?.status)
  } catch (e: any) {
    errors.value = e?.data?.errors ?? {}
    if (!e?.data?.errors) snackbar.add({ type: 'error', text: e?.data?.message || 'The password could not be changed' })
  } finally {
    saving.value = false
  }
}
</script>
