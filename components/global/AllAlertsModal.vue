<template>
  <v-dialog v-model="show" max-width="960" scrollable :z-index="9999">
    <v-card class="all-alerts-card">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center bg-primary text-white pa-4">
        <div class="d-flex align-center gap-2">
          <v-icon>mdi-bell-outline</v-icon>
          <span class="text-h6">Todas las Notificaciones</span>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="close" size="small" color="white" />
      </v-card-title>

      <!-- Category tabs -->
      <v-tabs
        v-model="activeTab"
        bg-color="surface"
        color="primary"
        density="comfortable"
        show-arrows
        @update:model-value="onTabChange"
      >
        <v-tab value="">
          <v-icon size="16" class="mr-1">mdi-bell-outline</v-icon>
          Todas
        </v-tab>
        <v-tab
          v-for="cat in categories"
          :key="cat.code"
          :value="cat.code"
        >
          <v-icon v-if="cat.icon" size="16" class="mr-1">{{ cat.icon }}</v-icon>
          {{ cat.name }}
        </v-tab>
      </v-tabs>

      <v-divider />

      <!-- Filters row -->
      <div class="d-flex align-center gap-2 pa-3 flex-wrap" style="background: rgba(var(--v-theme-surface-variant), 0.15)">
        <v-text-field
          v-model="searchQuery"
          density="compact"
          variant="outlined"
          placeholder="Buscar notificaciones..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          clearable
          style="max-width: 280px"
          @keyup.enter="applyFilters"
          @click:clear="searchQuery = ''; applyFilters()"
        />
        <v-select
          v-model="severityFilter"
          density="compact"
          variant="outlined"
          :items="severityOptions"
          item-title="label"
          item-value="value"
          placeholder="Severidad"
          hide-details
          clearable
          style="max-width: 170px"
        />
        <v-select
          v-model="readFilter"
          density="compact"
          variant="outlined"
          :items="readOptions"
          item-title="label"
          item-value="value"
          placeholder="Estado"
          hide-details
          clearable
          style="max-width: 150px"
        />
        <v-btn size="small" color="primary" variant="tonal" @click="applyFilters">
          <v-icon size="16" class="mr-1">mdi-filter</v-icon>
          Filtrar
        </v-btn>
        <v-btn size="small" variant="text" @click="clearFilters">
          Limpiar
        </v-btn>
      </div>

      <v-divider />

      <!-- Alerts list -->
      <v-card-text class="pa-0" style="max-height: 55vh; overflow-y: auto">
        <v-progress-linear v-if="loading" indeterminate color="primary" />

        <div v-if="!loading && alerts.length === 0" class="text-center pa-12 text-medium-emphasis">
          <v-icon size="64" class="opacity-30 mb-3">mdi-bell-off-outline</v-icon>
          <div class="text-h6">Sin notificaciones</div>
          <div class="text-body-2 mt-1">No se encontraron alertas con los filtros aplicados</div>
        </div>

        <div v-if="alerts.length > 0">
          <AlertCard
            v-for="alert in alerts"
            :key="alert.id"
            :alert="alert"
            :show-category="!activeTab"
            @open="handleAlertClick"
            @read="markRead"
            @dismiss="dismissAlert"
          />
        </div>
      </v-card-text>

      <v-divider />

      <!-- Footer pagination -->
      <v-card-actions class="d-flex justify-space-between align-center pa-3">
        <div class="text-caption text-medium-emphasis">
          Página {{ pagination.current_page }} de {{ pagination.last_page }} ({{ pagination.total }} total)
        </div>

        <v-pagination
          v-model="pagination.current_page"
          :length="pagination.last_page"
          :total-visible="5"
          size="small"
          density="compact"
          @update:model-value="loadPage"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { IAlert, IAlertCategorySummary } from '~/repository/modules/alerts'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'alert-dismissed'): void
}>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const alerts = ref<IAlert[]>([])
const loading = ref(false)
const categories = ref<IAlertCategorySummary[]>([])

const activeTab = ref('')
const searchQuery = ref('')
const severityFilter = ref<string | null>(null)
const readFilter = ref<string | null>(null)

const severityOptions = [
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Critical', value: 'critical' },
]

const readOptions = [
  { label: 'Sin leer', value: 'unread' },
  { label: 'Leídas', value: 'read' },
]

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
})

const buildFilters = () => {
  const f: Record<string, string> = {}
  if (activeTab.value) f.category = activeTab.value
  if (severityFilter.value) f.severity = severityFilter.value
  if (searchQuery.value?.trim()) f.search = searchQuery.value.trim()
  if (readFilter.value) f.read_status = readFilter.value
  return f
}

const loadAlerts = async (page: number = 1) => {
  loading.value = true
  try {
    const response = await $api.alerts.getAllAlerts(page, 20, buildFilters()) as any
    alerts.value = response.data || []
    pagination.value = {
      current_page: response.current_page || 1,
      last_page: response.last_page || 1,
      per_page: response.per_page || 20,
      total: response.total || 0,
    }
  } catch (error) {
    console.error('Error loading all alerts:', error)
    snackbar.add({ type: 'error', text: 'Error al cargar las notificaciones' })
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    categories.value = (await $api.alerts.getUserCategories()) as any
  } catch (e) {
    categories.value = []
  }
}

const loadPage = (page: number) => loadAlerts(page)

const onTabChange = () => {
  pagination.value.current_page = 1
  loadAlerts(1)
}

const applyFilters = () => {
  pagination.value.current_page = 1
  loadAlerts(1)
}

const clearFilters = () => {
  searchQuery.value = ''
  severityFilter.value = null
  readFilter.value = null
  applyFilters()
}

const handleAlertClick = async (alert: IAlert) => {
  if (!alert.read_at) {
    try {
      await $api.alerts.markAsRead(alert.alert_user_id)
      alert.read_at = new Date().toISOString()
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  if (alert.action_url) {
    close()
    router.push(alert.action_url)
  }
}

const markRead = async (alert: IAlert) => {
  try {
    await $api.alerts.markAsRead(alert.alert_user_id)
    alert.read_at = new Date().toISOString()
  } catch (e) {
    console.error('Error marking alert as read:', e)
  }
}

const dismissAlert = async (alert: IAlert) => {
  try {
    await $api.alerts.dismiss(alert.alert_user_id)
    snackbar.add({ type: 'success', text: 'Notificación descartada' })
    alerts.value = alerts.value.filter((a) => a.id !== alert.id)
    pagination.value.total--
    emit('alert-dismissed')
  } catch (error) {
    console.error('Error dismissing alert:', error)
    snackbar.add({ type: 'error', text: 'Error al descartar' })
  }
}

const close = () => {
  show.value = false
}

watch(show, (newValue) => {
  if (newValue) {
    loadAlerts(1)
    loadCategories()
  }
})
</script>

<style scoped>
.all-alerts-card {
  border-radius: 12px;
  overflow: hidden;
}
</style>
