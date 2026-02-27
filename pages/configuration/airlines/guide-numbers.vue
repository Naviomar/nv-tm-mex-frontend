<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/airlines" class="mb-4">
      Back to airlines
    </v-btn>

    <div class="flex items-center justify-between w-full mb-4">
      <div class="text-xl">Airline Guide Numbers</div>
      <div class="flex gap-2">
        <v-btn color="success" prepend-icon="mdi-file-excel" @click="showImportDialog = true">
          Import Excel
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true"> Add Guide Number </v-btn>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-span-2">
          <v-autocomplete
            density="compact"
            label="Airline"
            v-model="filters.airline_id"
            :items="airlines"
            item-title="name"
            item-value="id"
            clearable
          />
        </div>
        <div class="col-span-2">
          <v-text-field density="compact" label="Guide Number" v-model="filters.guide_number" clearable />
        </div>
        <div class="col-span-1">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.is_used"
            :items="statusOptions"
            item-title="name"
            item-value="value"
            clearable
          />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
        </div>
      </div>
    </div>

    <!-- Table -->
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="80">Actions</th>
              <th class="text-left">Airline</th>
              <th class="text-left">Prefix</th>
              <th class="text-left">Guide Number</th>
              <th class="text-left">Full AWB</th>
              <th class="text-left">Status</th>
              <th class="text-left">Used In Reference</th>
              <th class="text-left">Used By</th>
              <th class="text-left">Used At</th>
              <th class="text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in guideNumbers.data"
              :key="`gn-${index}`"
              :class="{
                'bg-red-100! dark:bg-red-900!': item.deleted_at,
                'bg-green-50 dark:bg-green-900/20': item.is_used,
              }"
            >
              <td>
                <div class="flex gap-1">
                  <v-btn
                    v-if="!item.is_used && !item.deleted_at"
                    icon
                    size="x-small"
                    color="error"
                    variant="text"
                    @click="showConfirmDelete(item)"
                    title="Delete"
                  >
                    <v-icon size="small">mdi-delete</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="item.deleted_at"
                    icon
                    size="x-small"
                    color="success"
                    variant="text"
                    @click="showConfirmDelete(item)"
                    title="Restore"
                  >
                    <v-icon size="small">mdi-restore</v-icon>
                  </v-btn>
                </div>
              </td>
              <td>{{ item.airline?.name }}</td>
              <td>
                <v-chip size="small" color="primary" variant="outlined">
                  {{ item.airline?.prefix }}
                </v-chip>
              </td>
              <td>{{ item.guide_number }}</td>
              <td>
                <span class="font-mono font-bold">{{ item.airline?.prefix }}-{{ item.guide_number }}</span>
              </td>
              <td>
                <v-chip :color="item.is_used ? 'success' : 'default'" size="small">
                  {{ item.is_used ? 'Used' : 'Available' }}
                </v-chip>
              </td>
              <td>
                <span v-if="item.air_reference">
                  {{ item.air_reference.reference_number }}
                </span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td>
                <span v-if="item.used_by_user">{{ item.used_by_user.name }}</span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td>
                <span v-if="item.used_at">{{ formatDateString(item.used_at) }}</span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td>{{ formatDateString(item.created_at) }}</td>
            </tr>
            <tr v-if="!guideNumbers.data?.length">
              <td colspan="10" class="text-center py-4 text-gray-400">No guide numbers found</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="guideNumbers.current_page"
          :length="guideNumbers.last_page"
          rounded="circle"
          density="comfortable"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>

    <!-- Add Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500" persistent>
      <v-card>
        <v-card-title>Add Guide Number</v-card-title>
        <v-card-text>
          <v-autocomplete
            density="compact"
            label="Airline *"
            v-model="addForm.airline_id"
            :items="airlines"
            item-title="name"
            item-value="id"
          />
          <v-text-field
            density="compact"
            label="Guide Number *"
            v-model="addForm.guide_number"
            hint="Enter the guide number (without airline prefix)"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="createGuideNumber">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import Excel Dialog -->
    <v-dialog v-model="showImportDialog" max-width="500" persistent>
      <v-card>
        <v-card-title>Import Guide Numbers from Excel</v-card-title>
        <v-card-text>
          <v-autocomplete
            density="compact"
            label="Airline *"
            v-model="importForm.airline_id"
            :items="airlines"
            item-title="name"
            item-value="id"
          />
          <v-file-input
            density="compact"
            label="Excel File (.xlsx, .xls, .csv) *"
            v-model="importForm.file"
            accept=".xlsx,.xls,.csv"
            prepend-icon="mdi-file-excel"
          />
          <v-alert type="info" density="compact" variant="tonal" class="mt-2">
            The Excel file should have guide numbers in the first column. One number per row.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" @click="showImportDialog = false">Cancel</v-btn>
          <v-btn color="success" @click="importExcel">Import</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Airline Guide Numbers',
  layout: 'default',
})

const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const statusOptions = [
  { name: 'Available', value: '0' },
  { name: 'Used', value: '1' },
]

const filters = ref({
  airline_id: null as number | null,
  guide_number: '',
  is_used: null as string | null,
})

const guideNumbers = ref({
  data: [] as any[],
  current_page: 1,
  page: 1,
  perPage: 50,
  last_page: 1,
})

const airlines = ref<any[]>([])
const showAddDialog = ref(false)
const showImportDialog = ref(false)

const addForm = ref({
  airline_id: null as number | null,
  guide_number: '',
})

const importForm = ref({
  airline_id: null as number | null,
  file: null as File[] | null,
})

const onClickFilters = async () => {
  guideNumbers.value.current_page = 1
  await getGuideNumbers()
}

const onClickPagination = async (page: number) => {
  guideNumbers.value.current_page = page
  await getGuideNumbers()
}

const getGuideNumbers = async () => {
  try {
    loadingStore.start()
    const queryFilters: any = {
      page: guideNumbers.value.current_page,
      perPage: guideNumbers.value.perPage,
    }
    if (filters.value.airline_id) queryFilters.airline_id = filters.value.airline_id
    if (filters.value.guide_number) queryFilters.guide_number = filters.value.guide_number
    if (filters.value.is_used !== null && filters.value.is_used !== '') queryFilters.is_used = filters.value.is_used

    const response = await $api.airlineGuideNumbers.getGuideNumbers({
      query: queryFilters,
    })
    guideNumbers.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getAirlines = async () => {
  try {
    const response = await $api.airlines.searchAirlines()
    airlines.value = response as any
  } catch (e) {
    console.error(e)
  }
}

const createGuideNumber = async () => {
  try {
    if (!addForm.value.airline_id || !addForm.value.guide_number) {
      snackbar.add({ type: 'error', text: 'Airline and guide number are required' })
      return
    }
    loadingStore.start()
    await $api.airlineGuideNumbers.create(addForm.value)
    snackbar.add({ type: 'success', text: 'Guide number created successfully' })
    showAddDialog.value = false
    addForm.value = { airline_id: null, guide_number: '' }
    await getGuideNumbers()
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.data?.message || 'Error creating guide number' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const importExcel = async () => {
  try {
    if (!importForm.value.airline_id || !importForm.value.file?.length) {
      snackbar.add({ type: 'error', text: 'Airline and file are required' })
      return
    }
    loadingStore.start()
    const response = (await $api.airlineGuideNumbers.importExcel({
      airline_id: importForm.value.airline_id,
      file: importForm.value.file[0],
    })) as any
    snackbar.add({ type: 'success', text: response.message || 'Import completed' })
    showImportDialog.value = false
    importForm.value = { airline_id: null, file: null }
    await getGuideNumbers()
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.data?.message || 'Error importing file' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const showConfirmDelete = async (item: any) => {
  const action = item.deleted_at ? 'restore' : 'delete'
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: action === 'delete' ? 'Delete' : 'Restore',
    content: `Please confirm you want to ${action} this guide number.`,
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: action === 'delete' ? 'error' : 'success',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.airlineGuideNumbers.delete(item.id)
      snackbar.add({ type: 'success', text: `Guide number ${action}d successfully` })
      await getGuideNumbers()
    } catch (e: any) {
      console.error(e)
      snackbar.add({ type: 'error', text: e?.data?.message || `Error ${action}ing guide number` })
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const clearFilters = async () => {
  filters.value = {
    airline_id: null,
    guide_number: '',
    is_used: null,
  }
  await getGuideNumbers()
}

// Check for airline_id query param (when navigating from airlines page)
const route = useRoute()
onMounted(async () => {
  await getAirlines()
  if (route.query.airline_id) {
    filters.value.airline_id = Number(route.query.airline_id)
  }
  await getGuideNumbers()
})
</script>
