<template>
  <v-card class="mb-4">
    <v-card-title>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <v-icon>mdi-cash-edit</v-icon>
          Rate Overrides
        </div>
        <div v-if="canCreate">
          <v-btn color="primary" size="small" @click="showCreateDialog = true">
            <v-icon size="small" class="mr-1">mdi-plus</v-icon>
            Add Override
          </v-btn>
        </div>
      </div>
    </v-card-title>
    <v-card-subtitle>
      Custom rates that override system-calculated rates for this reference.
    </v-card-subtitle>
    <v-card-text>
      <!-- Active Override Alert -->
      <v-alert v-if="activeOverride" type="info" density="compact" class="mb-4" variant="tonal">
        <div class="flex items-center gap-2">
          <v-icon>mdi-information</v-icon>
          <div>
            <strong>Active Override:</strong>
            Rate 1: {{ activeOverride.rate_1 !== null ? formatCurrency(activeOverride.rate_1) : 'N/A' }} |
            Rate 2: {{ activeOverride.rate_2 !== null ? formatCurrency(activeOverride.rate_2) : 'N/A' }}
            <span class="text-xs ml-2">
              ({{ formatDateOnlyString(activeOverride.start_date) }} - {{ activeOverride.end_date ? formatDateOnlyString(activeOverride.end_date) : 'Indefinite' }})
            </span>
          </div>
        </div>
      </v-alert>

      <!-- Overrides Table -->
      <v-table v-if="overrides.length > 0" density="compact">
        <thead>
          <tr>
            <th v-if="canEdit || canDelete" class="w-20">Actions</th>
            <th>Rate 1</th>
            <th>Rate 2</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Comments</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="override in overrides" :key="override.id" :class="{ 'bg-blue-50 dark:bg-blue-900': isActive(override) }">
            <td v-if="canEdit || canDelete">
              <div class="flex gap-1">
                <v-btn v-if="canEdit" icon size="x-small" color="primary" variant="text" @click="editOverride(override)">
                  <v-icon size="small">mdi-pencil</v-icon>
                </v-btn>
                <v-btn v-if="canDelete" icon size="x-small" color="error" variant="text" @click="confirmDelete(override)">
                  <v-icon size="small">mdi-delete</v-icon>
                </v-btn>
              </div>
            </td>
            <td>
              <v-chip v-if="override.rate_1 !== null" size="small" color="primary" variant="outlined">
                {{ formatCurrency(override.rate_1) }}
              </v-chip>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td>
              <v-chip v-if="override.rate_2 !== null" size="small" color="secondary" variant="outlined">
                {{ formatCurrency(override.rate_2) }}
              </v-chip>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td>{{ formatDateOnlyString(override.start_date) }}</td>
            <td>{{ override.end_date ? formatDateOnlyString(override.end_date) : 'Indefinite' }}</td>
            <td class="max-w-48 truncate" :title="override.comments">{{ override.comments || '—' }}</td>
            <td>
              <UserInfoBadge :item="override">
                {{ formatDateString(override.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div v-else class="text-center py-4 text-gray-500">
        No rate overrides configured for this reference.
      </div>
    </v-card-text>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="500" persistent>
      <v-card>
        <v-card-title>
          {{ editingOverride ? 'Edit Rate Override' : 'Create Rate Override' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="isFormValid">
            <div class="grid grid-cols-2 gap-4">
              <v-text-field
                v-model="form.rate_1"
                label="Rate 1"
                type="number"
                step="0.01"
                prefix="$"
                density="compact"
                variant="outlined"
                hint="Leave empty to use system rate"
                persistent-hint
              />
              <v-text-field
                v-model="form.rate_2"
                label="Rate 2"
                type="number"
                step="0.01"
                prefix="$"
                density="compact"
                variant="outlined"
                hint="Leave empty to use system rate"
                persistent-hint
              />
            </div>

            <div class="grid grid-cols-2 gap-4 mt-4">
              <v-text-field
                v-model="form.start_date"
                label="Start Date *"
                type="date"
                density="compact"
                variant="outlined"
                :rules="[rules.required]"
              />
              <v-text-field
                v-model="form.end_date"
                label="End Date (optional)"
                type="date"
                density="compact"
                variant="outlined"
                hint="Leave empty for indefinite"
                persistent-hint
              />
            </div>

            <v-textarea
              v-model="form.comments"
              label="Comments"
              rows="2"
              density="compact"
              variant="outlined"
              class="mt-4"
              hint="Reason for the override"
              persistent-hint
            />

            <v-alert v-if="formError" type="error" density="compact" class="mt-4" variant="tonal">
              {{ formError }}
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" :disabled="!isFormValid || saving" @click="saveOverride">
            {{ editingOverride ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this rate override?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteOverride">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { permissions } from '@/utils/data/system'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { hasPermission } = useCheckUser()

const props = defineProps<{
  referenciaId: string
  activeOverride?: any
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// Permissions
const canView = computed(() => hasPermission(permissions.DemurragesRateOverrideView))
const canCreate = computed(() => hasPermission(permissions.DemurragesRateOverrideCreate))
const canEdit = computed(() => hasPermission(permissions.DemurragesRateOverrideEdit))
const canDelete = computed(() => hasPermission(permissions.DemurragesRateOverrideDelete))

// State
const overrides = ref<any[]>([])
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const editingOverride = ref<any>(null)
const deletingOverride = ref<any>(null)
const saving = ref(false)
const deleting = ref(false)
const formRef = ref()
const isFormValid = ref(false)
const formError = ref('')

const form = reactive({
  rate_1: null as number | null,
  rate_2: null as number | null,
  start_date: '',
  end_date: '',
  comments: '',
})

const rules = {
  required: (v: any) => !!v || 'Required',
}

// Check if an override is currently active
const isActive = (override: any) => {
  const today = new Date().toISOString().split('T')[0] as string
  const start = override.start_date?.substring(0, 10) as string
  const end = override.end_date?.substring(0, 10) as string | undefined
  return start && start <= today && (!end || end >= today)
}

// Load overrides
const loadOverrides = async () => {
  if (!canView.value) return
  
  try {
    loadingStore.start()
    const response = await $api.demurrages.getRateOverrides(props.referenciaId)
    overrides.value = response as any[]
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

// Edit override
const editOverride = (override: any) => {
  editingOverride.value = override
  form.rate_1 = override.rate_1
  form.rate_2 = override.rate_2
  form.start_date = override.start_date?.substring(0, 10) || ''
  form.end_date = override.end_date?.substring(0, 10) || ''
  form.comments = override.comments || ''
  formError.value = ''
  showCreateDialog.value = true
}

// Save override (create or update)
const saveOverride = async () => {
  formError.value = ''
  
  if (!form.rate_1 && !form.rate_2) {
    formError.value = 'At least one rate (Rate 1 or Rate 2) must be provided.'
    return
  }

  saving.value = true
  try {
    loadingStore.start()
    const payload = {
      rate_1: form.rate_1 || null,
      rate_2: form.rate_2 || null,
      start_date: form.start_date,
      end_date: form.end_date || null,
      comments: form.comments || null,
    }

    if (editingOverride.value) {
      await $api.demurrages.updateRateOverride(props.referenciaId, editingOverride.value.id.toString(), payload)
      snackbar.add({ type: 'success', text: 'Rate override updated successfully.' })
    } else {
      await $api.demurrages.createRateOverride(props.referenciaId, payload)
      snackbar.add({ type: 'success', text: 'Rate override created successfully.' })
    }

    closeDialog()
    await loadOverrides()
    emit('refresh')
  } catch (e: any) {
    console.error(e)
    formError.value = e?.data?.message || e?.message || 'Error saving rate override.'
  } finally {
    saving.value = false
    setTimeout(() => loadingStore.stop(), 250)
  }
}

// Confirm delete
const confirmDelete = (override: any) => {
  deletingOverride.value = override
  showDeleteDialog.value = true
}

// Delete override
const deleteOverride = async () => {
  if (!deletingOverride.value) return

  deleting.value = true
  try {
    loadingStore.start()
    await $api.demurrages.deleteRateOverride(props.referenciaId, deletingOverride.value.id.toString())
    snackbar.add({ type: 'success', text: 'Rate override deleted successfully.' })
    showDeleteDialog.value = false
    deletingOverride.value = null
    await loadOverrides()
    emit('refresh')
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.data?.message || 'Error deleting rate override.' })
  } finally {
    deleting.value = false
    setTimeout(() => loadingStore.stop(), 250)
  }
}

// Close dialog and reset form
const closeDialog = () => {
  showCreateDialog.value = false
  editingOverride.value = null
  form.rate_1 = null
  form.rate_2 = null
  form.start_date = ''
  form.end_date = ''
  form.comments = ''
  formError.value = ''
}

// Format helpers
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

onMounted(async () => {
  if (canView.value) {
    await loadOverrides()
  }
})
</script>
