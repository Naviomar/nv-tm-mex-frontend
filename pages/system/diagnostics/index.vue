<template>
  <div class="diagnostics-page">
    <v-container fluid class="pa-6">
      <div class="dp-header mb-6">
        <v-avatar color="primary" variant="tonal" size="52" rounded="lg">
          <v-icon size="30">mdi-heart-pulse</v-icon>
        </v-avatar>
        <div>
          <h1 class="text-h4 font-weight-bold">Diagnostics</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">System health, safe email tests, template audit and performance probes</p>
        </div>
        <v-spacer />
        <v-chip v-if="environment" :color="environment === 'production' ? 'error' : 'info'" variant="flat" label size="large" class="font-weight-bold text-uppercase">
          <v-icon start size="16">mdi-server</v-icon>{{ environment }}
        </v-chip>
      </div>

      <v-card v-if="state === 'disabled'" elevation="0" class="tm-panel">
        <v-card-text class="text-center py-12">
          <v-icon size="56" class="mb-3 text-medium-emphasis">mdi-power-plug-off-outline</v-icon>
          <h2 class="text-h6 mb-2">The diagnostics module is turned off</h2>
          <p class="text-medium-emphasis mb-0">Set <code>DIAGNOSTICS_ENABLED=true</code> in the backend environment to use it.</p>
        </v-card-text>
      </v-card>

      <template v-else-if="state === 'ready'">
        <v-tabs v-model="tab" color="primary" class="mb-6 dp-tabs" show-arrows>
          <v-tab value="health" prepend-icon="mdi-heart-pulse">Health</v-tab>
          <v-tab v-if="canMailTest" value="mail" prepend-icon="mdi-email-fast-outline">Mail sandbox</v-tab>
          <v-tab value="templates" prepend-icon="mdi-email-edit-outline">Email templates</v-tab>
          <v-tab value="probes" prepend-icon="mdi-speedometer">Performance</v-tab>
          <v-tab value="history" prepend-icon="mdi-history">History</v-tab>
        </v-tabs>

        <v-window v-model="tab" :touch="false">
          <v-window-item value="health"><DiagnosticsHealthPanel /></v-window-item>
          <v-window-item v-if="canMailTest" value="mail"><DiagnosticsMailPanel :initial-scenario="scenario" /></v-window-item>
          <v-window-item value="templates"><DiagnosticsTemplatesPanel @test-scenario="testScenario" /></v-window-item>
          <v-window-item value="probes"><DiagnosticsProbesPanel /></v-window-item>
          <v-window-item value="history"><DiagnosticsHistoryPanel /></v-window-item>
        </v-window>
      </template>

      <v-progress-linear v-else indeterminate />
    </v-container>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Diagnostics',
  layout: 'default',
})

const { $api } = useNuxtApp()
const { hasPermission } = useCheckUser()
const canMailTest = computed(() => hasPermission('diagnostics-mail-test'))

const state = ref<'loading' | 'ready' | 'disabled'>('loading')
const environment = ref<string | null>(null)
const tab = ref('health')
const scenario = ref<string | null>(null)

const testScenario = (key: string) => {
  scenario.value = key
  if (canMailTest.value) tab.value = 'mail'
}

onMounted(async () => {
  try {
    const response: any = await $api.diagnostics.status()
    environment.value = response.environment
    state.value = response.enabled ? 'ready' : 'disabled'
  } catch (e) {
    console.error(e)
    state.value = 'disabled'
  }
})
</script>

<style scoped>
.dp-header { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; }
.dp-tabs { border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); }
</style>
