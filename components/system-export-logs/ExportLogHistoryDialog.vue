<template>
  <v-dialog v-model="dialogVisible" max-width="1100" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center ga-3">
        <v-icon>mdi-download-box-outline</v-icon>
        Export history
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="dialogVisible = false"></v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div class="grid grid-cols-3 gap-4 mb-4" @keyup.enter="onSearch">
          <v-text-field
            v-model="filters.search"
            type="text"
            density="compact"
            label="User or file name"
            clearable
            hide-details
          />
          <v-text-field
            v-model="filters.date_from"
            type="date"
            density="compact"
            label="Date from"
            hide-details
          />
          <v-text-field
            v-model="filters.date_to"
            type="date"
            density="compact"
            label="Date to"
            hide-details
          />
        </div>
        <div class="d-flex ga-2 mb-4">
          <v-btn size="small" variant="outlined" color="secondary" @click="onClear">Clear</v-btn>
          <v-btn size="small" color="primary" @click="onSearch">Search</v-btn>
        </div>

        <div class="mb-3">
          <v-pagination
            v-model="pagination.current_page"
            :length="pagination.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="fetchLogs"
          ></v-pagination>
        </div>

        <ExportLogTable
          :logs="logs"
          :loading="isLoading"
          :downloading-id="downloadingId"
          @download="onDownload"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { IExportLog } from '~/repository/modules/exportLogs'

const dialogVisible = defineModel<boolean>({ default: false })

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const logs = ref<IExportLog[]>([])
const isLoading = ref(false)
const downloadingId = ref<number | null>(null)
const pagination = ref({ current_page: 1, last_page: 1 })
const filters = ref({
  search: '',
  date_from: '',
  date_to: '',
})

const fetchLogs = async () => {
  try {
    isLoading.value = true
    const response: any = await $api.exportLogs.index({
      page: pagination.value.current_page,
      ...filters.value,
    })
    logs.value = response.data
    pagination.value.current_page = response.current_page
    pagination.value.last_page = response.last_page
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading export history.' })
  } finally {
    isLoading.value = false
  }
}

const onSearch = () => {
  pagination.value.current_page = 1
  fetchLogs()
}

const onClear = () => {
  filters.value = { search: '', date_from: '', date_to: '' }
  onSearch()
}

const onDownload = async (log: IExportLog) => {
  try {
    downloadingId.value = log.id
    const response: any = await $api.exportLogs.download(log.id)
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = log.file_name
    link.click()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error downloading the file.' })
  } finally {
    downloadingId.value = null
  }
}

watch(dialogVisible, (visible) => {
  if (visible) fetchLogs()
})
</script>
