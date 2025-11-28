<template>
  <div class="rounded-lg shadow flex flex-col gap-4 w-full">
    <div class="font-bold text-lg">Demurrage Estatus Report</div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Cliente -->
      <div class="col-span-3">
        <ACustomerSearch v-model="filters.customer_id" />
      </div>

      <div class="col-span-3">
        <AGlobalSearch
          :onSearch="searchCustomerGroups"
          v-model="filters.customer_group_id"
          validate-key="customer_group_id"
          label="Custmer group *"
        />
      </div>

      <div class="col-span-3">
        <v-autocomplete
          v-model="filters.is_parcial"
          label="Estatus *"
          :items="[
            { value: 1, name: 'Parcial' },
            { value: 0, name: 'Total' },
          ]"
          item-title="name"
          item-value="value"
          clearable
          density="compact"
        />
      </div>

      <div class="col-span-1">
        <v-text-field
          v-model="filters.startDate"
          clearable
          type="date"
          density="compact"
          label="Start date"
          hide-details
        />
      </div>
      <div class="col-span-1">
        <v-text-field v-model="filters.endDate" clearable type="date" density="compact" label="End date" hide-details />
      </div>
    </div>
    <!-- Botón Exportar -->
    <div class="flex items-end">
      <v-btn color="primary" class="w-full" @click="exportDemurragesReportXlsx" prepend-icon="mdi-file-excel">
        Exportar a Excel
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const filters = ref<any>({
  customer_id: '',
  customer_group_id: '',
  parcial_total: '',
  startDate: '',
  endDate: '',
})

const searchCustomerGroups = async () => {
  try {
    loadingStore.loading = true
    const body = {
      name: filters.value.customer_id,
    }
    const response = await $api.consigneeGroups.searchByName(body)
    return response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const exportDemurragesReportXlsx = async () => {
  try {
    loadingStore.start()

    const response = (await $api.demurrages.exportXlsxReport({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })) as any

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    // agrega timestamp to filename
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '')
    link.download = `reporte-demoras-${timestamp}.xlsx`
    link.click()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
