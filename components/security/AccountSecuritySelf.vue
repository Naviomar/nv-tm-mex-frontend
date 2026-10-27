<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <v-card elevation="0" class="tm-border">
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-form-textbox-password</v-icon>Password
      </v-card-title>
      <v-card-text>
        <div v-if="status?.password_changed_at" class="text-caption text-medium-emphasis mb-3">
          Last changed {{ formatDateString(status.password_changed_at) }}
        </div>
        <PasswordChangeForm @changed="load" />
      </v-card-text>
    </v-card>

    <v-card elevation="0" class="tm-border">
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-shield-key-outline</v-icon>Two-factor authentication
      </v-card-title>
      <v-card-text>
        <TwoFactorSettings v-if="status" :enabled="status.two_factor_enabled" :required="status.two_factor_required" @changed="onTwoFactorChanged" />
      </v-card-text>
    </v-card>

    <v-card elevation="0" class="tm-border lg:col-span-2">
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-history</v-icon>My recent sign-ins
      </v-card-title>
      <v-card-text>
        <div class="text-caption text-medium-emphasis mb-2">Don't recognize something? Change your password and tell your administrator.</div>
        <LoginEventsTable :rows="events.data" :page="events.page" :total="events.total" :per-page="events.per_page" @page="loadEvents" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const { refreshIdentity } = useSanctumAuth()

const status = ref<any>(null)
const events = ref<any>({ data: [], page: 1, total: 0, per_page: 20 })

async function load() {
  status.value = await $api.accountSecurity.status()
  await loadEvents(1)
}

async function loadEvents(page = 1) {
  events.value = await $api.accountSecurity.myLoginEvents(page)
}

async function onTwoFactorChanged() {
  await Promise.all([load(), refreshIdentity()])
}

onMounted(load)
</script>
