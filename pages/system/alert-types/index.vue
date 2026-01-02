<template>
  <div class="pa-6">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2">
          <v-icon icon="mdi-bell-cog" size="28" color="primary" />
          <span class="text-h5">Tipos de Alerta</span>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Nuevo Tipo de Alerta
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="alertTypes"
          :loading="loading"
          :items-per-page="15"
        >
          <template #item.category="{ item }">
            <v-chip
              v-if="item.category"
              size="small"
              :color="item.category.color"
            >
              <v-icon :icon="item.category.icon" size="16" class="mr-1" />
              {{ item.category.name }}
            </v-chip>
          </template>

          <template #item.severity="{ item }">
            <v-chip
              size="small"
              :color="getSeverityColor(item.severity)"
            >
              {{ getSeverityLabel(item.severity) }}
            </v-chip>
          </template>

          <template #item.trigger_type="{ item }">
            <v-chip size="small" variant="tonal">
              {{ getTriggerLabel(item.trigger_type) }}
            </v-chip>
          </template>

          <template #item.is_active="{ item }">
            <v-switch
              :model-value="item.is_active"
              color="success"
              hide-details
              @update:model-value="toggleActive(item)"
            />
          </template>

          <template #item.recipients="{ item }">
            <div class="d-flex gap-1">
              <v-chip
                v-if="item.roles && item.roles.length > 0"
                size="small"
                color="info"
              >
                <v-icon icon="mdi-shield-account" size="14" class="mr-1" />
                {{ item.roles.length }} roles
              </v-chip>
              <v-chip
                v-if="item.users && item.users.length > 0"
                size="small"
                color="success"
              >
                <v-icon icon="mdi-account" size="14" class="mr-1" />
                {{ item.users.length }} usuarios
              </v-chip>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-account-multiple"
                size="small"
                variant="text"
                color="primary"
                title="Asignar destinatarios"
                @click="openAssignDialog(item)"
              />
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="info"
                title="Editar"
                @click="openEditDialog(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                title="Eliminar"
                @click="confirmDelete(item)"
              />
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog Create/Edit -->
    <v-dialog v-model="dialog" max-width="700">
      <v-card>
        <v-card-title class="bg-primary">
          <span class="text-white">
            {{ editingItem ? 'Editar' : 'Crear' }} Tipo de Alerta
          </span>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="formData.name"
                  label="Nombre"
                  :rules="[v => !!v || 'Requerido']"
                  required
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.code"
                  label="Código"
                  :rules="[v => !!v || 'Requerido']"
                  hint="snake_case único"
                  persistent-hint
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.alert_category_id"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Categoría"
                  :rules="[v => !!v || 'Requerido']"
                  required
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon :icon="item.raw.icon" :color="item.raw.color" />
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.severity"
                  :items="severityOptions"
                  label="Severidad"
                  :rules="[v => !!v || 'Requerido']"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.trigger_type"
                  :items="triggerOptions"
                  label="Tipo de Trigger"
                  :rules="[v => !!v || 'Requerido']"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.icon"
                  label="Icono (Material Design)"
                  hint="Ej: mdi-alert-circle"
                  persistent-hint
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Descripción"
                  rows="2"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-switch
                  v-model="formData.is_active"
                  label="Activo"
                  color="success"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-switch
                  v-model="formData.send_email"
                  label="Enviar Email"
                  color="info"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-switch
                  v-model="formData.send_push"
                  label="Enviar Push"
                  color="primary"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="saving"
            @click="saveItem"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Assign Recipients -->
    <v-dialog v-model="assignDialog" max-width="800">
      <v-card>
        <v-card-title class="bg-primary">
          <span class="text-white">
            Asignar Destinatarios - {{ assigningItem?.name }}
          </span>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-tabs v-model="assignTab" color="primary">
            <v-tab value="roles">
              <v-icon icon="mdi-shield-account" class="mr-2" />
              Roles
            </v-tab>
            <v-tab value="users">
              <v-icon icon="mdi-account-multiple" class="mr-2" />
              Usuarios
            </v-tab>
          </v-tabs>

          <v-window v-model="assignTab" class="mt-4">
            <v-window-item value="roles">
              <v-autocomplete
                v-model="selectedRoles"
                :items="roles"
                item-title="name"
                item-value="id"
                label="Seleccionar Roles"
                multiple
                chips
                closable-chips
              />
            </v-window-item>

            <v-window-item value="users">
              <v-autocomplete
                v-model="selectedUsers"
                :items="users"
                item-title="name"
                item-value="id"
                label="Seleccionar Usuarios"
                multiple
                chips
                closable-chips
              />
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeAssignDialog">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="saving"
            @click="saveAssignments"
          >
            Guardar Asignaciones
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Confirmar Eliminación
        </v-card-title>
        <v-card-text>
          ¿Está seguro de eliminar el tipo de alerta "{{ deletingItem?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="deleting"
            @click="deleteItem"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { IAlertType, IAlertCategory } from '~/repository/modules/alerts'

definePageMeta({
  title: 'Tipos de Alerta',
  layout: 'default',
})

const api = useApiFactory()
const snackbar = useSnackbar()

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const dialog = ref(false)
const assignDialog = ref(false)
const deleteDialog = ref(false)
const assignTab = ref('roles')

const alertTypes = ref<IAlertType[]>([])
const categories = ref<IAlertCategory[]>([])
const roles = ref<any[]>([])
const users = ref<any[]>([])

const editingItem = ref<IAlertType | null>(null)
const assigningItem = ref<IAlertType | null>(null)
const deletingItem = ref<IAlertType | null>(null)

const selectedRoles = ref<number[]>([])
const selectedUsers = ref<number[]>([])

const formRef = ref()
const formData = ref({
  name: '',
  code: '',
  alert_category_id: null as number | null,
  description: '',
  severity: 'info',
  trigger_type: 'automatic',
  icon: '',
  color: '',
  is_active: true,
  send_email: false,
  send_push: true,
})

const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Categoría', key: 'category', sortable: false },
  { title: 'Severidad', key: 'severity', sortable: true },
  { title: 'Trigger', key: 'trigger_type', sortable: true },
  { title: 'Destinatarios', key: 'recipients', sortable: false },
  { title: 'Activo', key: 'is_active', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

const severityOptions = [
  { title: 'Info', value: 'info' },
  { title: 'Warning', value: 'warning' },
  { title: 'Error', value: 'error' },
  { title: 'Critical', value: 'critical' },
]

const triggerOptions = [
  { title: 'Automático', value: 'automatic' },
  { title: 'Manual', value: 'manual' },
  { title: 'Programado', value: 'scheduled' },
]

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    critical: 'error',
  }
  return colors[severity] || 'grey'
}

const getSeverityLabel = (severity: string) => {
  const labels: Record<string, string> = {
    info: 'Info',
    warning: 'Advertencia',
    error: 'Error',
    critical: 'Crítico',
  }
  return labels[severity] || severity
}

const getTriggerLabel = (trigger: string) => {
  const labels: Record<string, string> = {
    automatic: 'Automático',
    manual: 'Manual',
    scheduled: 'Programado',
  }
  return labels[trigger] || trigger
}

const fetchData = async () => {
  loading.value = true
  try {
    const [typesRes, categoriesRes, rolesRes, usersRes] = await Promise.all([
      api.alerts.getTypes({ limit: 500 }),
      api.alerts.getAllCategories(),
      api.users.getRoles(),
      api.users.getUsers(),
    ])
    const typesPayload: any = (typesRes as any)?.data ?? typesRes
    alertTypes.value = typesPayload?.data ?? typesPayload
    categories.value = categoriesRes.data || categoriesRes
    roles.value = rolesRes.data || rolesRes
    users.value = usersRes.data || usersRes
  } catch (error: any) {
    snackbar.add({
      type: 'error',
      text: 'Error al cargar datos: ' + (error?.message ?? 'Error desconocido'),
    })
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingItem.value = null
  formData.value = {
    name: '',
    code: '',
    alert_category_id: null,
    description: '',
    severity: 'info',
    trigger_type: 'automatic',
    icon: '',
    color: '',
    is_active: true,
    send_email: false,
    send_push: true,
  }
  dialog.value = true
}

const openEditDialog = (item: IAlertType) => {
  editingItem.value = item
  formData.value = {
    name: item.name,
    code: item.code,
    alert_category_id: item.alert_category_id,
    description: item.description || '',
    severity: item.severity,
    trigger_type: item.trigger_type,
    icon: item.icon || '',
    color: item.color || '',
    is_active: item.is_active,
    send_email: item.send_email,
    send_push: item.send_push,
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editingItem.value = null
}

const saveItem = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    if (editingItem.value) {
      await api.alerts.updateType(editingItem.value.id, formData.value)
      snackbar.add({ type: 'success', text: 'Tipo de alerta actualizado' })
    } else {
      await api.alerts.createType(formData.value)
      snackbar.add({ type: 'success', text: 'Tipo de alerta creado' })
    }
    closeDialog()
    fetchData()
  } catch (error: any) {
    snackbar.add({
      type: 'error',
      text: 'Error: ' + (error?.message ?? 'Error desconocido'),
    })
  } finally {
    saving.value = false
  }
}

const toggleActive = async (item: IAlertType) => {
  try {
    await api.alerts.updateType(item.id, { is_active: !item.is_active })
    item.is_active = !item.is_active
    snackbar.add({ type: 'success', text: 'Estado actualizado' })
  } catch (error: any) {
    snackbar.add({
      type: 'error',
      text: 'Error: ' + (error?.message ?? 'Error desconocido'),
    })
  }
}

const openAssignDialog = async (item: IAlertType) => {
  assigningItem.value = item
  selectedRoles.value = item.roles?.map((r: any) => r.id) || []
  selectedUsers.value = item.users?.map((u: any) => u.id) || []
  assignDialog.value = true
}

const closeAssignDialog = () => {
  assignDialog.value = false
  assigningItem.value = null
}

const saveAssignments = async () => {
  if (!assigningItem.value) return

  saving.value = true
  try {
    await Promise.all([
      api.alerts.syncTypeRoles(assigningItem.value.id, selectedRoles.value),
      api.alerts.syncTypeUsers(assigningItem.value.id, selectedUsers.value),
    ])
    snackbar.add({ type: 'success', text: 'Asignaciones guardadas' })
    closeAssignDialog()
    fetchData()
  } catch (error: any) {
    snackbar.add({
      type: 'error',
      text: 'Error: ' + (error?.message ?? 'Error desconocido'),
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item: IAlertType) => {
  deletingItem.value = item
  deleteDialog.value = true
}

const deleteItem = async () => {
  if (!deletingItem.value) return

  deleting.value = true
  try {
    await api.alerts.deleteType(deletingItem.value.id)
    snackbar.add({ type: 'success', text: 'Tipo de alerta eliminado' })
    deleteDialog.value = false
    deletingItem.value = null
    fetchData()
  } catch (error: any) {
    snackbar.add({
      type: 'error',
      text: 'Error: ' + (error?.message ?? 'Error desconocido'),
    })
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
