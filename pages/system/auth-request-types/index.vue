<template>
  <div class="pa-6">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2">
          <v-icon icon="mdi-key-variant" size="28" color="primary" />
          <span class="text-h5">Tipos de Solicitud de Autorización</span>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Nuevo Tipo
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="types"
          :loading="loading"
          :items-per-page="15"
        >
          <template #item.kind="{ item }">
            <v-chip
              size="small"
              :color="item.kind === 'authorization' ? 'blue' : 'purple'"
              variant="tonal"
            >
              {{ item.kind === 'authorization' ? 'Autorización' : 'Proceso' }}
            </v-chip>
          </template>

          <template #item.code="{ item }">
            <code class="text-caption">{{ item.code }}</code>
          </template>

          <template #item.is_active="{ item }">
            <v-chip
              size="small"
              :color="item.is_active ? 'success' : 'grey'"
              variant="tonal"
            >
              {{ item.is_active ? 'Activo' : 'Inactivo' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="openEditDialog(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="confirmDelete(item)"
              />
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="600">
      <v-card>
        <v-card-title>
          {{ editingType ? 'Editar Tipo' : 'Nuevo Tipo' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-select
              v-model="form.kind"
              label="Tipo"
              :items="kindOptions"
              item-title="label"
              item-value="value"
              required
            />
            <v-text-field
              v-model="form.code"
              label="Código"
              required
              :rules="codeRules"
              hint="Ej: cancel-invoice-tm o supplier-work-past-date"
            />
            <v-text-field
              v-model="form.description"
              label="Descripción"
              required
            />
            <v-text-field
              v-model="form.redirect"
              label="Ruta de Redirección"
              hint="Ruta del frontend (opcional)"
            />
            <v-text-field
              v-if="form.kind === 'process'"
              v-model="form.key_label"
              label="Etiqueta de Clave"
              hint="Etiqueta para request_key (solo para procesos)"
            />
            <v-text-field
              v-model="form.icon"
              label="Icono (Material Design)"
              hint="Ej: mdi-cancel"
            />
            <v-text-field
              v-model="form.color"
              label="Color"
              hint="Nombre de color Vuetify (opcional)"
            />
            <v-switch
              v-model="form.is_active"
              label="Activo"
              color="primary"
            />
            <v-text-field
              v-model.number="form.sort_order"
              label="Orden"
              type="number"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="save">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de eliminar el tipo "{{ deletingType?.description }}"?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="showDeleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteType">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { IAuthRequestType } from '~/repository/modules/catalogs/authRequestTypes'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

definePageMeta({
  title: 'Auth Request Types - System',
  layout: 'default',
})

const types = ref<IAuthRequestType[]>([])
const loading = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingType = ref<IAuthRequestType | null>(null)
const deletingType = ref<IAuthRequestType | null>(null)
const saving = ref(false)
const deleting = ref(false)
const formRef = ref()

const kindOptions = [
  { label: 'Autorización (AuthorizationRequest)', value: 'authorization' },
  { label: 'Proceso (ProcessRequest)', value: 'process' },
]

const headers = [
  { title: 'Tipo', key: 'kind' },
  { title: 'Código', key: 'code' },
  { title: 'Descripción', key: 'description' },
  { title: 'Estado', key: 'is_active' },
  { title: 'Orden', key: 'sort_order' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const form = ref({
  kind: 'authorization' as 'authorization' | 'process',
  code: '',
  description: '',
  redirect: '',
  key_label: '',
  icon: '',
  color: '',
  is_active: true,
  sort_order: 0,
})

const codeRules = [(v: string) => !!v || 'Código requerido']

const loadTypes = async () => {
  loading.value = true
  try {
    types.value = (await $api.authRequestTypes.getTypes()) as any
  } catch (e) {
    snackbar.add({ type: 'error', text: 'Error al cargar tipos' })
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingType.value = null
  form.value = {
    kind: 'authorization',
    code: '',
    description: '',
    redirect: '',
    key_label: '',
    icon: '',
    color: '',
    is_active: true,
    sort_order: 0,
  }
  showDialog.value = true
}

const openEditDialog = (type: IAuthRequestType) => {
  editingType.value = type
  form.value = { ...type }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingType.value = null
}

const save = async () => {
  if (!formRef.value?.validate()) return

  saving.value = true
  try {
    if (editingType.value) {
      await $api.authRequestTypes.updateType(editingType.value.id, form.value)
      snackbar.add({ type: 'success', text: 'Tipo actualizado' })
    } else {
      await $api.authRequestTypes.createType(form.value)
      snackbar.add({ type: 'success', text: 'Tipo creado' })
    }
    closeDialog()
    await loadTypes()
  } catch (e) {
    snackbar.add({ type: 'error', text: 'Error al guardar' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (type: IAuthRequestType) => {
  deletingType.value = type
  showDeleteDialog.value = true
}

const deleteType = async () => {
  if (!deletingType.value) return

  deleting.value = true
  try {
    await $api.authRequestTypes.deleteType(deletingType.value.id)
    snackbar.add({ type: 'success', text: 'Tipo eliminado' })
    showDeleteDialog.value = false
    await loadTypes()
  } catch (e) {
    snackbar.add({ type: 'error', text: 'Error al eliminar' })
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadTypes()
})
</script>
