<template>
  <div>
    <div class="p-4 bg-sky-100 dark:bg-neutral-800 rounded-lg">
      <div class="font-bold">Payments History Report</div>
      <!-- Filters -->
      <v-card class="mb-6" flat>
        <v-card-text>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Input for 'From' date -->
            <div class="d-flex justify-center">
              <v-date-picker
                v-model="filters.fromDate"
                label="From"
                density="compact"
                hide-details
                :max="filters.toDate"
                :first-day-of-week="1"
                locale="es"
              />
            </div>
            <!-- Input for 'To' date -->
            <div class="d-flex justify-center">
              <v-date-picker
                v-model="filters.toDate"
                label="To"
                density="compact"
                hide-details
                :min="filters.fromDate"
                :first-day-of-week="1"
                locale="es"
              />
            </div>
            <ACustomerSearch v-model="filters.customer_id" :hide-details="true" />

            <div class="flex gap-2 items-center">
              <v-btn size="small" color="" variant="text" @click="clearFilters">Clear</v-btn>
              <v-btn size="small" color="primary" @click="applyFilters">Apply</v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
      <div>Este reporte incluye la cobranza de todas las referencias marítimas y aéreas.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const loadingStore = useLoadingStore()

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

// Today
const today = new Date()
const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
const lastDayCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const filters = ref<any>({
  fromDate: firstDayLastMonth,
  toDate: lastDayCurrentMonth,
  customer_id: null,
})

const dateRangeFromTo = computed(() => ({
  from: filters.value.fromDate ? formatDate(new Date(filters.value.fromDate)) : null,
  to: filters.value.toDate ? formatDate(new Date(filters.value.toDate)) : null,
}))

const applyFilters = async () => {
  try {
    loadingStore.loading = true

    const queryFilters = {
      customer_id: filters.value.customer_id,
      from: dateRangeFromTo.value.from,
      to: dateRangeFromTo.value.to,
    }

    const response = await $api.reports.getPaymentsHistory({
      query: {
        ...flattenArraysToCommaSeparatedString(queryFilters),
      },
    })

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `payments_history_report_${formatDate(new Date())}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const clearFilters = () => {
  filters.value.fromDate = firstDayLastMonth
  filters.value.toDate = lastDayCurrentMonth
  filters.value.customer_id = null
  // Optionally, refetch the dashboard data without filters
  applyFilters()
}
</script>
