<template>
  <div v-if="status">
    <div class="d-flex flex-wrap ga-2 mb-4">
      <v-chip :color="status.must_change_password ? 'warning' : 'success'" variant="tonal">
        <v-icon start>{{ status.must_change_password ? 'mdi-lock-reset' : 'mdi-lock-check-outline' }}</v-icon>
        {{ status.must_change_password ? 'Must change password' : 'Password OK' }}
      </v-chip>
      <v-chip :color="status.two_factor_enabled ? 'success' : status.two_factor_required ? 'warning' : 'grey'" variant="tonal">
        <v-icon start>{{ status.two_factor_enabled ? 'mdi-shield-check' : 'mdi-shield-off-outline' }}</v-icon>
        {{ status.two_factor_enabled ? '2FA on' : status.two_factor_required ? '2FA required, not set up' : '2FA off' }}
      </v-chip>
      <v-chip v-if="status.two_factor_required" color="primary" variant="outlined">2FA required</v-chip>
      <v-chip v-if="status.locked" color="error" variant="tonal">
        <v-icon start>mdi-lock-alert-outline</v-icon>Locked {{ Math.ceil(status.locked_seconds / 60) }} min
      </v-chip>
      <v-chip v-if="status.password_changed_at" variant="text" size="small" class="text-medium-emphasis">
        Password changed {{ formatDateString(status.password_changed_at) }}
      </v-chip>
    </div>

    <div class="d-flex flex-wrap ga-2 mb-4">
      <v-btn
        v-if="!status.must_change_password"
        color="warning"
        variant="tonal"
        prepend-icon="mdi-lock-reset"
        :loading="busy === 'force'"
        @click="forcePassword(true)"
      >
        Require password change
      </v-btn>
      <v-btn v-else variant="tonal" prepend-icon="mdi-lock-open-variant-outline" :loading="busy === 'force'" @click="forcePassword(false)">
        Cancel password change
      </v-btn>
      <v-btn
        variant="tonal"
        color="primary"
        :prepend-icon="status.two_factor_required ? 'mdi-shield-off-outline' : 'mdi-shield-key-outline'"
        :loading="busy === 'require'"
        @click="requireTwoFactor(!status.two_factor_required)"
      >
        {{ status.two_factor_required ? 'Stop requiring 2FA' : 'Require 2FA' }}
      </v-btn>
      <v-btn
        v-if="status.two_factor_enabled"
        variant="tonal"
        color="error"
        prepend-icon="mdi-shield-refresh-outline"
        :loading="busy === 'reset'"
        @click="resetDialog = true"
      >
        Reset 2FA (lost phone)
      </v-btn>
      <v-btn v-if="status.locked" variant="tonal" color="success" prepend-icon="mdi-lock-open-outline" :loading="busy === 'unlock'" @click="unlock">
        Unlock
      </v-btn>
    </div>

    <div class="text-subtitle-2 mb-1">Recent sign-in activity</div>
    <LoginEventsTable :rows="events.data" :page="events.page" :total="events.total" :per-page="events.per_page" @page="loadEvents" />

    <v-dialog v-model="resetDialog" max-width="480">
      <v-card>
        <v-card-title>Reset two-factor authentication?</v-card-title>
        <v-card-text>
          <v-text-field v-model="resetReason" label="Reason (optional)" density="comfortable" variant="outlined" hide-details />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="resetDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="busy === 'reset'" @click="resetTwoFactor">Reset</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ userId: number | string }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const status = ref<any>(null)
const events = ref<any>({ data: [], page: 1, total: 0, per_page: 25 })
const busy = ref<string | null>(null)
const resetDialog = ref(false)
const resetReason = ref('')

const target = () => ({ scope: 'users' as const, user_ids: [Number(props.userId)], include_inactive: true })

async function load() {
  status.value = await $api.accountSecurity.userStatus(props.userId)
}

async function loadEvents(page = 1) {
  events.value = await $api.accountSecurity.userLoginEvents(props.userId, page)
}

async function run(key: string, fn: () => Promise<any>, message: string) {
  busy.value = key
  try {
    await fn()
    snackbar.add({ type: 'success', text: message })
    await Promise.all([load(), loadEvents(1)])
  } finally {
    busy.value = null
  }
}

const forcePassword = (active: boolean) =>
  run('force', () => $api.accountSecurity.forcePasswordChange({ ...target(), active }), active ? 'The user must change the password' : 'Password change cancelled')

const requireTwoFactor = (required: boolean) =>
  run('require', () => $api.accountSecurity.requireTwoFactor({ ...target(), required }), required ? '2FA is now required' : '2FA no longer required')

const unlock = () => run('unlock', () => $api.accountSecurity.unlock(props.userId), 'Account unlocked')

async function resetTwoFactor() {
  await run('reset', () => $api.accountSecurity.resetTwoFactor(props.userId, resetReason.value || null), '2FA reset')
  resetDialog.value = false
  resetReason.value = ''
}

watch(() => props.userId, () => Promise.all([load(), loadEvents(1)]))
onMounted(() => Promise.all([load(), loadEvents(1)]))
</script>
