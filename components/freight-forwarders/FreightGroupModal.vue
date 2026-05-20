<template>
  <v-dialog v-model="dialog.show" max-width="600" scrollable persistent>
    <v-card rounded="xl">
      <v-toolbar color="primary" density="comfortable">
        <v-toolbar-title>
          {{ dialog.mode === 'create' ? 'Create Freight Group' : dialog.mode === 'edit' ? 'Edit Freight Group' : 'View Freight Group' }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
      </v-toolbar>
      <v-card-text class="space-y-4 pt-4">
        <div class="grid grid-cols-1 gap-3">
          <v-text-field
            v-model="form.name"
            label="Name *"
            variant="outlined"
            density="compact"
            :readonly="dialog.mode === 'view'"
            :error-messages="errors.name"
          />
          <v-text-field
            v-model="form.code"
            label="Code"
            variant="outlined"
            density="compact"
            :readonly="dialog.mode === 'view'"
          />
        </div>

        <!-- Similar items search -->
        <v-card variant="tonal" color="info" class="mt-3">
          <v-card-text class="pa-3">
            <div class="flex items-center gap-2">
              <v-icon size="small">mdi-information-outline</v-icon>
              <span class="text-sm">Search for similar groups before saving</span>
            </div>
          </v-card-text>
        </v-card>

        <v-btn
          v-if="dialog.mode !== 'view'"
          color="primary"
          prepend-icon="mdi-magnify"
          size="small"
          @click="searchSimilar"
          :loading="searching"
        >
          Search similar
        </v-btn>

        <div v-if="similarItems.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
          <div class="text-sm font-medium text-grey-darken-1">Similar groups:</div>
          <v-card
            v-for="item in similarItems"
            :key="item.id"
            variant="outlined"
            density="compact"
            class="pa-2"
          >
            <div class="text-sm font-medium">{{ item.name }}</div>
            <div class="text-xs text-grey-darken-1">#{{ item.id }} · Code: {{ item.code || '—' }}</div>
          </v-card>
        </div>

        <!-- History section for edit mode -->
        <div v-if="dialog.mode === 'edit' && historyItems.length > 0" class="mt-4">
          <v-divider class="mb-3" />
          <div class="text-sm font-medium text-grey-darken-1 mb-2">History (deleted records):</div>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <v-card
              v-for="item in historyItems"
              :key="item.id"
              variant="tonal"
              color="error"
              density="compact"
              class="pa-2"
            >
              <div class="text-sm font-medium">{{ item.name }}</div>
              <div class="text-xs text-grey-darken-1">
                #{{ item.id }} · Code: {{ item.code || '—' }} · Deleted: {{ formatDateString(item.deleted_at) }}
              </div>
            </v-card>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn
          v-if="dialog.mode !== 'view'"
          color="primary"
          prepend-icon="mdi-content-save"
          :loading="saving"
          @click="save"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const dialog = reactive({
  show: false,
  mode: 'create' as 'create' | 'edit' | 'view',
  itemId: null as number | null,
})

const form = reactive({
  name: '',
  code: '',
})

const errors = reactive({
  name: '',
})

const similarItems = ref<any[]>([])
const historyItems = ref<any[]>([])
const searching = ref(false)
const saving = ref(false)

const openCreate = () => {
  dialog.mode = 'create'
  dialog.itemId = null
  resetForm()
  dialog.show = true
}

const openEdit = async (id: number) => {
  dialog.mode = 'edit'
  dialog.itemId = id
  await loadFreightGroup(id)
  await loadHistory(id)
  dialog.show = true
}

const openView = async (id: number) => {
  dialog.mode = 'view'
  dialog.itemId = id
  await loadFreightGroup(id)
  await loadHistory(id)
  dialog.show = true
}

const closeDialog = () => {
  dialog.show = false
  resetForm()
  similarItems.value = []
  historyItems.value = []
}

const resetForm = () => {
  form.name = ''
  form.code = ''
  errors.name = ''
}

const loadFreightGroup = async (id: number) => {
  try {
    loadingStore.start()
    const response = await $api.freightForwardersGroups.getById(id.toString())
    Object.assign(form, response)
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading freight group' })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const loadHistory = async (id: number) => {
  try {
    loadingStore.start()
    // Fetch deleted records for this group using soft delete
    const response = await $api.freightForwardersGroups.getFreightForwardersGroups({
      query: {
        deleted_status: 'deleted',
        page: 1,
        perPage: 100,
      },
    })
    // Filter to show only history of the current group (by name similarity or other criteria)
    // Since we can't directly query by ID with soft deleted records, we'll show all deleted groups
    historyItems.value = Array.isArray(response?.data) ? response.data : []
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const searchSimilar = async () => {
  if (!form.name) {
    snackbar.add({ type: 'warning', text: 'Name is required to search' })
    return
  }

  try {
    searching.value = true
    const body = { name: form.name }
    const response = await $api.freightForwardersGroups.searchByName(body)
    const items = Array.isArray(response) ? response : []
    similarItems.value = dialog.mode === 'edit' && dialog.itemId
      ? items.filter((group: any) => String(group.id) !== String(dialog.itemId))
      : items
  } catch (e) {
    console.error(e)
  } finally {
    searching.value = false
  }
}

const validate = () => {
  errors.name = ''

  let isValid = true

  if (!form.name || form.name.trim() === '') {
    errors.name = 'Name is required'
    isValid = false
  }

  return isValid
}

const save = async () => {
  if (!validate()) {
    return
  }

  try {
    saving.value = true
    loadingStore.start()

    if (dialog.mode === 'create') {
      await $api.freightForwardersGroups.create(form)
      snackbar.add({ type: 'success', text: 'Freight group created' })
    } else if (dialog.mode === 'edit' && dialog.itemId) {
      await $api.freightForwardersGroups.update(dialog.itemId.toString(), form)
      snackbar.add({ type: 'success', text: 'Freight group updated' })
    }

    closeDialog()
    emit('refresh')
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error saving freight group' })
  } finally {
    saving.value = false
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const formatDateString = (date: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString()
}

const emit = defineEmits(['refresh'])

defineExpose({
  openCreate,
  openEdit,
  openView,
})
</script>
