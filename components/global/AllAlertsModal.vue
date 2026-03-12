<template>
  <v-dialog v-model="show" max-width="900" scrollable :z-index="9999">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center bg-primary text-white">
        <div class="d-flex align-center gap-2">
          <v-icon>mdi-bell-outline</v-icon>
          <span>All Alerts</span>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="close" size="small" color="white" />
      </v-card-title>

      <v-card-text class="pa-0">
        <v-progress-linear v-if="loading" indeterminate color="primary" />

        <div v-if="!loading && alerts.length === 0" class="text-center pa-8 text-grey">
          <v-icon size="64" color="grey-lighten-1">mdi-bell-off-outline</v-icon>
          <div class="text-h6 mt-4">No alerts</div>
        </div>

        <v-list v-if="alerts.length > 0" class="py-0">
          <template v-for="(alert, index) in alerts" :key="alert.id">
            <v-list-item
              :class="{
                'bg-blue-grey-lighten-5': !alert.read_at,
                'hover:bg-grey-lighten-4': true,
              }"
              @click="handleAlertClick(alert)"
            >
              <template v-slot:prepend>
                <v-avatar :color="getSeverityColor(alert.severity)" size="40">
                  <v-icon :icon="alert.icon || 'mdi-information'" color="white" />
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ alert.title }}
              </v-list-item-title>

              <v-list-item-subtitle v-if="alert.message" class="text-wrap mt-1">
                {{ alert.message }}
              </v-list-item-subtitle>

              <v-list-item-subtitle class="mt-2">
                <div class="d-flex align-center gap-2 flex-wrap">
                  <v-chip v-if="alert.category" size="x-small" variant="outlined">
                    {{ alert.category }}
                  </v-chip>
                  <v-chip size="x-small" :color="getSeverityColor(alert.severity)" variant="tonal">
                    {{ alert.severity }}
                  </v-chip>
                  <v-chip v-if="alert.read_at" size="x-small" color="green" variant="tonal">
                    <v-icon start size="14">mdi-check</v-icon>
                    Read
                  </v-chip>
                  <v-chip v-else size="x-small" color="orange" variant="tonal">
                    <v-icon start size="14">mdi-circle</v-icon>
                    Unread
                  </v-chip>
                  <span class="text-caption text-grey">{{ formatRelativeTime(alert.created_at) }}</span>
                </div>
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  size="small"
                  color="grey"
                  @click.stop="dismissAlert(alert)"
                />
              </template>
            </v-list-item>

            <v-divider v-if="index < alerts.length - 1" />
          </template>
        </v-list>
      </v-card-text>

      <v-divider />

      <v-card-actions class="d-flex justify-space-between align-center pa-4">
        <div class="text-caption text-grey">
          Page {{ pagination.current_page }} of {{ pagination.last_page }} ({{ pagination.total }} total)
        </div>

        <v-pagination
          v-model="pagination.current_page"
          :length="pagination.last_page"
          :total-visible="5"
          size="small"
          @update:model-value="loadPage"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { IAlert } from '~/repository/modules/alerts'

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
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
})

const loadAlerts = async (page: number = 1) => {
  loading.value = true
  try {
    const response = await $api.alerts.getAllAlerts(page, 20) as any
    alerts.value = response.data || []
    pagination.value = {
      current_page: response.current_page || 1,
      last_page: response.last_page || 1,
      per_page: response.per_page || 20,
      total: response.total || 0,
    }
  } catch (error) {
    console.error('Error loading all alerts:', error)
    snackbar.add({ type: 'error', text: 'Failed to load alerts' })
  } finally {
    loading.value = false
  }
}

const loadPage = (page: number) => {
  loadAlerts(page)
}

const handleAlertClick = async (alert: IAlert) => {
  // Mark as read if not already
  if (!alert.read_at) {
    try {
      await $api.alerts.markAsRead(alert.alert_user_id)
      alert.read_at = new Date().toISOString()
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  // Navigate if has action URL
  if (alert.action_url) {
    close()
    router.push(alert.action_url)
  }
}

const dismissAlert = async (alert: IAlert) => {
  try {
    await $api.alerts.dismiss(alert.alert_user_id)
    snackbar.add({ type: 'success', text: 'Alert dismissed' })
    
    // Remove from list
    alerts.value = alerts.value.filter((a) => a.id !== alert.id)
    pagination.value.total--
    
    emit('alert-dismissed')
  } catch (error) {
    console.error('Error dismissing alert:', error)
    snackbar.add({ type: 'error', text: 'Failed to dismiss alert' })
  }
}

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    info: 'blue',
    warning: 'orange',
    error: 'red',
    critical: 'purple',
  }
  return colors[severity] || 'grey'
}

const formatRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours} h`
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`
    return `Hace ${Math.floor(diffDays / 365)} años`
  } catch {
    return dateString
  }
}

const close = () => {
  show.value = false
}

watch(show, (newValue) => {
  if (newValue) {
    loadAlerts(1)
  }
})
</script>
