<template>
  <v-card>
    <v-card-title class="d-flex align-center gap-2">
      <v-icon icon="mdi-bell-ring" color="primary" />
      <span>Alertas Asignadas al Rol</span>
    </v-card-title>

    <v-card-text>
      <v-alert
        v-if="!roleId"
        type="info"
        variant="tonal"
        class="mb-4"
      >
        Seleccione un rol para gestionar sus alertas
      </v-alert>

      <div v-else>
        <div class="d-flex justify-space-between align-center mb-4">
          <p class="text-body-2 text-medium-emphasis">
            Tipos de alerta que recibirán los usuarios con este rol
          </p>
          <v-btn
            size="small"
            color="primary"
            prepend-icon="mdi-plus"
            @click="openAssignDialog"
          >
            Asignar Alertas
          </v-btn>
        </div>

        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

        <v-list v-if="assignedAlerts.length > 0" lines="two">
          <v-list-item
            v-for="alert in assignedAlerts"
            :key="alert.id"
            class="border-b"
          >
            <template #prepend>
              <v-avatar :color="getSeverityColor(alert.severity)" size="40">
                <v-icon :icon="alert.icon || 'mdi-bell'" color="white" />
              </v-avatar>
            </template>

            <v-list-item-title>{{ alert.name }}</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip size="x-small" class="mr-1" :color="alert.category?.color">
                {{ alert.category?.name }}
              </v-chip>
              {{ alert.description }}
            </v-list-item-subtitle>

            <template #append>
              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                color="error"
                @click="removeAlert(alert)"
              />
            </template>
          </v-list-item>
        </v-list>

        <v-alert v-else type="info" variant="tonal">
          Este rol no tiene alertas asignadas.
        </v-alert>
      </div>
    </v-card-text>

    <!-- Assign Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title class="bg-primary">
          <span class="text-white">Asignar Tipos de Alerta al Rol</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-autocomplete
            v-model="selectedAlertTypes"
            :items="availableAlertTypes"
            item-title="name"
            item-value="id"
            label="Seleccionar Tipos de Alerta"
            multiple
            chips
            closable-chips
          >
            <template #chip="{ props, item }">
              <v-chip
                v-bind="props"
                :color="getSeverityColor(item.raw.severity)"
              >
                <v-icon :icon="item.raw.icon || 'mdi-bell'" size="16" class="mr-1" />
                {{ item.raw.name }}
              </v-chip>
            </template>

            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-avatar :color="getSeverityColor(item.raw.severity)" size="32">
                    <v-icon :icon="item.raw.icon || 'mdi-bell'" color="white" size="18" />
                  </v-avatar>
                </template>
                <template #subtitle>
                  <v-chip size="x-small" :color="item.raw.category?.color">
                    {{ item.raw.category?.name }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="saving"
            @click="saveAssignments"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import type { IAlertType } from '~/repository/modules/alerts'

const props = defineProps<{
  roleId: number | null
}>()

const api = useApiFactory()
const { $toast } = useNuxtApp()

const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)

const assignedAlerts = ref<IAlertType[]>([])
const availableAlertTypes = ref<IAlertType[]>([])
const selectedAlertTypes = ref<number[]>([])

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    critical: 'error',
  }
  return colors[severity] || 'grey'
}

const fetchRoleAlerts = async () => {
  if (!props.roleId) return

  loading.value = true
  try {
    const response = await api.alerts.getAllTypes()
    const allTypes = response.data || response
    
    assignedAlerts.value = allTypes.filter((type: IAlertType) => 
      type.roles?.some((r: any) => r.id === props.roleId)
    )
  } catch (error: any) {
    $toast.error('Error al cargar alertas: ' + error.message)
  } finally {
    loading.value = false
  }
}

const openAssignDialog = async () => {
  try {
    const response = await api.alerts.getAllTypes()
    availableAlertTypes.value = response.data || response
    selectedAlertTypes.value = assignedAlerts.value.map(a => a.id)
    dialog.value = true
  } catch (error: any) {
    $toast.error('Error: ' + error.message)
  }
}

const saveAssignments = async () => {
  if (!props.roleId) return

  saving.value = true
  try {
    // Update each alert type to include/exclude this role
    const promises = availableAlertTypes.value.map(async (alertType) => {
      const currentRoles = alertType.roles?.map((r: any) => r.id) || []
      const shouldInclude = selectedAlertTypes.value.includes(alertType.id)
      const isIncluded = currentRoles.includes(props.roleId!)

      if (shouldInclude && !isIncluded) {
        // Add role
        await api.alerts.syncTypeRoles(alertType.id, [...currentRoles, props.roleId!])
      } else if (!shouldInclude && isIncluded) {
        // Remove role
        await api.alerts.syncTypeRoles(
          alertType.id,
          currentRoles.filter(id => id !== props.roleId)
        )
      }
    })

    await Promise.all(promises)
    $toast.success('Alertas asignadas correctamente')
    dialog.value = false
    await fetchRoleAlerts()
  } catch (error: any) {
    $toast.error('Error: ' + error.message)
  } finally {
    saving.value = false
  }
}

const removeAlert = async (alert: IAlertType) => {
  if (!props.roleId) return

  try {
    const currentRoles = alert.roles?.map((r: any) => r.id) || []
    await api.alerts.syncTypeRoles(
      alert.id,
      currentRoles.filter(id => id !== props.roleId)
    )
    $toast.success('Alerta removida')
    await fetchRoleAlerts()
  } catch (error: any) {
    $toast.error('Error: ' + error.message)
  }
}

watch(() => props.roleId, (newVal) => {
  if (newVal) {
    fetchRoleAlerts()
  } else {
    assignedAlerts.value = []
  }
}, { immediate: true })
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
</style>
