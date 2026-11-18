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
        <div class="text-caption text-medium-emphasis mb-1">Arribo desde (ETA)</div>
        <v-date-picker
          v-model="filters.startDate"
          density="compact"
          hide-header
          show-adjacent-months
          :max="filters.endDate ?? undefined"
          :first-day-of-week="1"
          locale="es"
          elevation="0"
          class="tm-border"
        />
      </div>
      <div class="col-span-1">
        <div class="text-caption text-medium-emphasis mb-1">Arribo hasta (ETA)</div>
        <v-date-picker
          v-model="filters.endDate"
          density="compact"
          hide-header
          show-adjacent-months
          :min="filters.startDate ?? undefined"
          :first-day-of-week="1"
          locale="es"
          elevation="0"
          class="tm-border"
        />
      </div>
      <div class="col-span-1 md:col-span-2 flex items-center gap-2">
        <v-btn size="small" variant="tonal" @click="setRange('month')">Este mes</v-btn>
        <v-btn size="small" variant="tonal" @click="setRange('90')">Últimos 90 días</v-btn>
        <v-btn size="small" variant="tonal" @click="setRange('year')">Este año</v-btn>
        <v-btn size="small" variant="text" prepend-icon="mdi-close" @click="setRange('clear')">Limpiar</v-btn>
        <span v-if="filters.startDate || filters.endDate" class="text-caption text-medium-emphasis ml-auto">
          {{ formatDate(filters.startDate) || '…' }} → {{ formatDate(filters.endDate) || '…' }}
        </span>
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
  startDate: null as Date | null,
  endDate: null as Date | null,
})

// Fecha local (YYYY-MM-DD); toISOString() la correría un día en zonas UTC-
const formatDate = (d: Date | null) => {
  if (!d) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const setRange = (preset: 'month' | '90' | 'year' | 'clear') => {
  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (preset === 'clear') {
    filters.value.startDate = null
    filters.value.endDate = null
    return
  }
  filters.value.endDate = end
  if (preset === 'month') filters.value.startDate = new Date(end.getFullYear(), end.getMonth(), 1)
  else if (preset === 'year') filters.value.startDate = new Date(end.getFullYear(), 0, 1)
  else filters.value.startDate = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 90)
}

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
        ...flattenArraysToCommaSeparatedString({
          ...filters.value,
          startDate: formatDate(filters.value.startDate),
          endDate: formatDate(filters.value.endDate),
        }),
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
