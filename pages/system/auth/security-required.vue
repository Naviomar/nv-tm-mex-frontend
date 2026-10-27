<template>
  <div class="security-page d-flex align-center justify-center pa-4">
    <v-card class="pa-8 rounded-xl" max-width="520" width="100%" elevation="0" border>
      <div class="text-center mb-6">
        <v-icon size="48" :color="pending === 'password' ? 'warning' : 'primary'">
          {{ pending === 'password' ? 'mdi-lock-reset' : 'mdi-shield-key-outline' }}
        </v-icon>
        <h1 class="text-h6 font-weight-bold mt-2">
          {{ pending === 'password' ? 'Change your password' : 'Set up two-factor authentication' }}
        </h1>
      </div>

      <PasswordChangeForm v-if="pending === 'password'" submit-label="Save and continue" @changed="next" />
      <TwoFactorSettings v-else-if="pending === 'two_factor'" :enabled="false" required @done="next" />

      <div class="text-center mt-6">
        <v-btn variant="text" size="small" prepend-icon="mdi-logout" @click="signOut">Sign out</v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { pendingSecurityRequirement } from '~/utils/security/loginEvents'

definePageMeta({
  title: 'Account security',
  layout: 'guest-empty',
})

const { user, refreshIdentity, logout } = useSanctumAuth()
const pending = computed(() => pendingSecurityRequirement(user.value))

async function signOut() {
  await logout()
  await navigateTo('/system/auth/login', { replace: true })
}

async function next() {
  await refreshIdentity()
  // Puede quedar otro requisito (p. ej. 2FA después del cambio de contraseña): la página se actualiza sola.
  if (!pendingSecurityRequirement(user.value)) {
    await navigateTo('/', { replace: true })
  }
}
</script>

<style scoped>
.security-page {
  min-height: 100vh;
}
</style>
