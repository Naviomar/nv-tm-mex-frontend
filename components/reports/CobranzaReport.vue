<template>
  <div>
    <div class="p-4 bg-sky-100 dark:bg-neutral-800 rounded-lg">
      <div class="font-bold">Cobranza Report</div>
      <!-- Filters -->
      <v-card class="mb-6" flat>
        <v-card-text>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 'From' date picker -->
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

            <!-- 'To' date picker -->
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

            <!-- Customer Search -->
            <ACustomerSearch v-model="filters.customer_id" :hide-details="true" />

            <!-- Action buttons -->
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
// First day of last month
const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
// Last day of current month
const lastDayCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

// Initialize the filters with the date range
const filters = ref<any>({
  fromDate: firstDayLastMonth,
  toDate: lastDayCurrentMonth,
  customer_id: null,
})

// Function to apply filters and fetch data
const applyFilters = async () => {
  try {
    loadingStore.loading = true

    // Prepare the query filters
    const queryFilters = {
      customer_id: filters.value.customer_id,
      from: formatDate(filters.value.fromDate),
      to: formatDate(filters.value.toDate),
    }

    // Send request to the API
    const response = await $api.reports.getCobranza({
      query: queryFilters,
    })

    // Download the Excel report
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `cobranza_report_${formatDate(new Date())}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e: any) {
    console.error(e)
    // if status code 403 show snackbar about permissions
    if (e?.response?.status === 403) {
      snackbar.add({
        text: 'You do not have permission to generate this report.',
        type: 'error',
      })
    } else {
      snackbar.add({
        text: 'An error occurred while generating the report.',
        type: 'error',
      })
    }
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

// Clear the filters
const clearFilters = () => {
  filters.value.fromDate = firstDayLastMonth
  filters.value.toDate = lastDayCurrentMonth
  filters.value.customer_id = null
  applyFilters() // Optionally, refetch the report without filters
}
</script>
