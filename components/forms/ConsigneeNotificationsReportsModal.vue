<template>
  <v-dialog :model-value="show" @update:model-value="emit('update:show', $event)" max-width="700px">
    <v-card>
      <v-card-title>Notification reports</v-card-title>
      <v-card-text>
        <div class="d-flex flex-column gap-4">
          <div>
            <v-checkbox
              v-model="includeCatalogCc"
              label="Include notification admin CC's"
              density="compact"
              hide-details
            />
            <v-btn
              color="success"
              variant="tonal"
              prepend-icon="mdi-file-excel-outline"
              :loading="exportingExcel"
              block
              @click="exportExcel"
            >
              Download matrix report
            </v-btn>
            <p class="text-caption text-medium-emphasis mt-1 mb-0">
              One row per customer email, one column per notification type. Also compares against the legacy
              system: emails only found there are marked in red, emails only found here are listed at the end.
            </p>
          </div>
          <div>
            <v-btn
              color="info"
              variant="tonal"
              prepend-icon="mdi-email-outline"
              :loading="exportingEmailList"
              block
              @click="exportEmailListExcel"
            >
              Download email list report
            </v-btn>
            <p class="text-caption text-medium-emphasis mt-1 mb-0">
              Plain list of every customer email, independent of notification coverage.
            </p>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  filters: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:show'])

const includeCatalogCc = ref(false)
const exportingExcel = ref(false)
const exportingEmailList = ref(false)

const close = () => {
  emit('update:show', false)
}

const datePart = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

const downloadExcelBlob = (data: any, filename: string) => {
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const exportExcel = async () => {
  try {
    exportingExcel.value = true
    const response: any = await $api.consignees.exportMissingNotificationsExcel({
      query: {
        name: props.filters.name,
        mail_notification_ids: (props.filters.mailNotificationIds.length
          ? props.filters.mailNotificationIds
          : props.filters.customerMailNotificationIds
        ).join(','),
        executive_ids: props.filters.executiveIds.join(',') || undefined,
        include_catalog_cc: includeCatalogCc.value ? 1 : 0,
      },
    })

    downloadExcelBlob(response, `reporte_notificaciones_clientes_${datePart()}.xlsx`)

    snackbar.add({
      text: 'Report generated and downloaded successfully.',
      type: 'success',
    })
  } catch (e) {
    console.error(e)
    snackbar.add({
      text: 'Error exporting the report.',
      type: 'error',
    })
  } finally {
    exportingExcel.value = false
  }
}

const exportEmailListExcel = async () => {
  try {
    exportingEmailList.value = true
    const response: any = await $api.consignees.exportMissingNotificationsEmailListExcel({
      query: {
        name: props.filters.name,
        executive_ids: props.filters.executiveIds.join(',') || undefined,
      },
    })

    downloadExcelBlob(response, `reporte_correos_clientes_${datePart()}.xlsx`)

    snackbar.add({
      text: 'Report generated and downloaded successfully.',
      type: 'success',
    })
  } catch (e) {
    console.error(e)
    snackbar.add({
      text: 'Error exporting the report.',
      type: 'error',
    })
  } finally {
    exportingEmailList.value = false
  }
}
</script>
