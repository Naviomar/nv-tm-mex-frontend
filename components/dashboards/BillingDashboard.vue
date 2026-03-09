<template>
  <div class="billing-dashboard">
    <!-- Professional Filter Section -->
    <v-card class="filter-section elevation-0 mb-6">
      <v-card-text class="pa-6">
        <div class="filter-header mb-5">
          <div class="flex items-center gap-3">
            <div class="filter-icon">
              <v-icon color="white" size="22">mdi-filter-variant</v-icon>
            </div>
            <div>
              <div class="filter-title">Advanced Filters</div>
              <div class="filter-subtitle">Refine your data view</div>
            </div>
          </div>
          <v-chip color="green-lighten-4" size="small" class="font-semibold">
            <v-icon start size="16">mdi-database-search</v-icon>
            {{ report.total_invoices }} Invoices
          </v-chip>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-9 gap-4 overflow-x-auto">
          <div class="md:col-span-3">
            <label class="filter-label">Start Date</label>
            <v-date-input
              v-model="filters.from"
              prepend-icon=""
              prepend-inner-icon="$calendar"
              variant="outlined"
              density="comfortable"
              hide-details
              class="modern-input"
            />
          </div>
          <div class="md:col-span-3">
            <label class="filter-label">End Date</label>
            <v-date-input
              v-model="filters.to"
              prepend-icon=""
              prepend-inner-icon="$calendar"
              variant="outlined"
              density="comfortable"
              hide-details
              class="modern-input"
            />
          </div>
          <div class="md:col-span-4">
            <label class="filter-label">Customer</label>
            <ACustomerSearch v-model="filters.customer_id" hide-details />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 md:col-span-2 items-end gap-2">
            <v-btn variant="outlined" color="grey-darken-1" block @click="clearFilters" class="modern-btn">
              <v-icon start>mdi-refresh</v-icon>
              Reset
            </v-btn>
            <v-btn variant="flat" color="primary" block @click="applyFilters" class="modern-btn">
              <v-icon start>mdi-magnify</v-icon>
              Search
            </v-btn>
          </div>
        </div>

        <div v-if="filters.from || filters.to" class="flex items-center gap-2 mt-4 pt-4 border-t border-grey-200">
          <span class="text-xs font-semibold text-grey-600">Active Filters:</span>
          <v-chip v-if="filters.from" size="small" color="primary" variant="tonal" closable @click:close="filters.from = null">
            From: {{ filters.from }}
          </v-chip>
          <v-chip v-if="filters.to" size="small" color="primary" variant="tonal" closable @click:close="filters.to = null">
            To: {{ filters.to }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <!-- Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      <v-card class="elevation-3 rounded-lg overflow-hidden stat-card">
        <div class="bg-gradient-to-br from-green-500 to-green-700 pa-4 text-white">
          <div class="flex items-center justify-between">
            <v-icon size="40" class="opacity-90">mdi-file-document-multiple</v-icon>
            <v-chip size="small" color="white" variant="flat" class="font-bold">Total</v-chip>
          </div>
        </div>
        <v-card-text class="pa-4">
          <div class="text-4xl font-bold text-green-700 dark:text-green-400 mb-1">
            {{ report.total_invoices }}
          </div>
          <div class="text-sm text-grey-600 dark:text-grey-400 font-medium">All Invoices</div>
        </v-card-text>
      </v-card>

      <v-card class="elevation-3 rounded-lg overflow-hidden stat-card">
        <div class="bg-gradient-to-br from-blue-500 to-blue-700 pa-4 text-white">
          <div class="flex items-center justify-between">
            <v-icon size="40" class="opacity-90">mdi-file-document</v-icon>
            <v-chip size="small" color="white" variant="flat" class="font-bold">TM</v-chip>
          </div>
        </div>
        <v-card-text class="pa-4">
          <div class="text-4xl font-bold text-blue-700 dark:text-blue-400 mb-1">
            {{ report.total_tm_invoices }}
          </div>
          <div class="text-sm text-grey-600 dark:text-grey-400 font-medium">TM Invoices</div>
        </v-card-text>
      </v-card>

      <v-card class="elevation-3 rounded-lg overflow-hidden stat-card">
        <div class="bg-gradient-to-br from-orange-500 to-orange-700 pa-4 text-white">
          <div class="flex items-center justify-between">
            <v-icon size="40" class="opacity-90">mdi-file-document-outline</v-icon>
            <v-chip size="small" color="white" variant="flat" class="font-bold">WM</v-chip>
          </div>
        </div>
        <v-card-text class="pa-4">
          <div class="text-4xl font-bold text-orange-700 dark:text-orange-400 mb-1">
            {{ report.total_wm_invoices }}
          </div>
          <div class="text-sm text-grey-600 dark:text-grey-400 font-medium">WM Invoices</div>
        </v-card-text>
      </v-card>

      <v-card class="elevation-3 rounded-lg overflow-hidden stat-card cursor-pointer" @click="dialogCustomer = true">
        <div class="bg-gradient-to-br from-purple-500 to-purple-700 pa-4 text-white">
          <div class="flex items-center justify-between">
            <v-icon size="40" class="opacity-90">mdi-account-group</v-icon>
            <v-chip size="small" color="white" variant="flat" class="font-bold">Customers</v-chip>
          </div>
        </div>
        <v-card-text class="pa-4">
          <div class="text-4xl font-bold text-purple-700 dark:text-purple-400 mb-1">
            {{ report.unique_customers }}
          </div>
          <div class="text-sm text-grey-600 dark:text-grey-400 font-medium flex items-center gap-1">
            Unique Customers
            <v-icon size="14">mdi-eye</v-icon>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Currency Totals -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div v-for="(values, currency) in report.amounts_by_currency" :key="currency">
        <v-card class="elevation-2 rounded-lg">
          <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 pa-3 text-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <v-icon size="28">mdi-currency-usd</v-icon>
                <span class="font-semibold text-lg">{{ currency }} Summary</span>
              </div>
            </div>
          </div>
          <v-card-text class="pa-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs text-grey-600 dark:text-grey-400 mb-1 font-medium">Total Amount</div>
                <div class="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {{ formatToCurrency(values.total) }}
                </div>
              </div>
              <div>
                <div class="text-xs text-grey-600 dark:text-grey-400 mb-1 font-medium">Total Paid</div>
                <div class="text-2xl font-bold text-green-700 dark:text-green-400">
                  {{ formatToCurrency(values.paid) }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- TM Invoices by Service -->
    <v-card class="elevation-2 rounded-lg mb-6 invoice-section-card">
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 pa-3 text-white">
        <div class="flex items-center gap-2">
          <v-icon size="28">mdi-file-chart</v-icon>
          <span class="font-semibold text-lg">TM Invoices by Service</span>
        </div>
      </div>
      <v-card-text class="pa-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center pa-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
            <v-icon color="blue" size="32" class="mb-2">mdi-ferry</v-icon>
            <div class="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">
              {{ report.total_sea_import_tm }}
            </div>
            <div class="text-sm text-grey-700 dark:text-grey-300 font-medium">Maritime Import</div>
          </div>
          <div class="text-center pa-3 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800">
            <v-icon color="teal" size="32" class="mb-2">mdi-ship-wheel</v-icon>
            <div class="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-1">
              {{ report.total_sea_export_tm }}
            </div>
            <div class="text-sm text-grey-700 dark:text-grey-300 font-medium">Maritime Export</div>
          </div>
          <div class="text-center pa-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
            <v-icon color="indigo" size="32" class="mb-2">mdi-airplane-landing</v-icon>
            <div class="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-1">
              {{ report.total_air_import_tm }}
            </div>
            <div class="text-sm text-grey-700 dark:text-grey-300 font-medium">Air Import</div>
          </div>
          <div class="text-center pa-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800">
            <v-icon color="cyan" size="32" class="mb-2">mdi-airplane-takeoff</v-icon>
            <div class="text-3xl font-bold text-cyan-700 dark:text-cyan-300 mb-1">
              {{ report.total_air_export_tm }}
            </div>
            <div class="text-sm text-grey-700 dark:text-grey-300 font-medium">Air Export</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- WM Invoices by Service -->
    <v-card class="elevation-2 rounded-lg mb-6 invoice-section-card">
      <div class="bg-gradient-to-r from-orange-500 to-orange-600 pa-3 text-white">
        <div class="flex items-center gap-2">
          <v-icon size="28">mdi-file-chart-outline</v-icon>
          <span class="font-semibold text-lg">WM Invoices by Service</span>
        </div>
      </div>
      <v-card-text class="pa-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center pa-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
            <v-icon color="blue" size="32" class="mb-2">mdi-ferry</v-icon>
            <div class="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">
              {{ report.total_sea_import_wm }}
            </div>
            <div class="text-sm text-grey-700 dark:text-grey-300 font-medium">Maritime Import</div>
          </div>
          <div class="text-center pa-3 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800">
            <v-icon color="teal" size="32" class="mb-2">mdi-ship-wheel</v-icon>
            <div class="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-1">
              {{ report.total_sea_export_wm }}
            </div>
            <div class="text-sm text-grey-700 dark:text-grey-300 font-medium">Maritime Export</div>
          </div>
          <div class="text-center pa-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
            <v-icon color="indigo" size="32" class="mb-2">mdi-airplane-landing</v-icon>
            <div class="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-1">
              {{ report.total_air_import_wm }}
            </div>
            <div class="text-sm text-grey-700 dark:text-grey-300 font-medium">Air Import</div>
          </div>
          <div class="text-center pa-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800">
            <v-icon color="cyan" size="32" class="mb-2">mdi-airplane-takeoff</v-icon>
            <div class="text-3xl font-bold text-cyan-700 dark:text-cyan-300 mb-1">
              {{ report.total_air_export_wm }}
            </div>
            <div class="text-sm text-grey-700 dark:text-grey-300 font-medium">Air Export</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Totals by Service and Currency -->
    <v-card class="elevation-2 rounded-lg">
      <div class="bg-gradient-to-r from-purple-500 to-purple-600 pa-3 text-white">
        <div class="flex items-center gap-2">
          <v-icon size="28">mdi-chart-box</v-icon>
          <span class="font-semibold text-lg">Totals by Service and Currency</span>
        </div>
      </div>
      <v-card-text class="pa-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <BillingAmountCard
            v-for="[key, value] in Object.entries(report).filter(([k]) => k.startsWith('total_amount_'))"
            :key="key"
            :title="formatServiceKey(key)"
            :subtitle="getCurrencyFromKey(key)"
            :amount="value"
            :paid="report[correspondingPaidKey(key)] ?? 0"
            :icon="getIconForService(key)"
          />
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogCustomer" max-width="500">
      <v-card>
        <v-card-title>
          <div class="flex items-center justify-between">
            <span class="text-h6">Customers ({{ report.customers?.length || 0 }})</span>
            <v-spacer />
            <v-btn icon @click="dialogCustomer = false"><v-icon icon="mdi-close" /></v-btn>
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-list v-if="report.customers?.length" density="compact">
            <v-list-item v-for="(customer, index) in report.customers" :key="index">
              <v-list-item-title class="font-medium">
                {{ customer.name || 'Unnamed' }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
          <div v-else class="text-sm text-gray-500">No customers found.</div>
        </v-card-text>
      </v-card>
    </v-dialog>
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

// Helper to get YYYY-MM-DD string
function getDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

// Build full range as array of dates (Vuetify requires individual dates)
function getDateRange(from: Date, to: Date): string[] {
  const dates = []
  const current = new Date(from)
  while (current <= to) {
    dates.push(current.toISOString())
    current.setDate(current.getDate() + 1)
  }
  return dates
}

const filters = ref<any>({
  from: getDateString(firstDayLastMonth),
  to: getDateString(lastDayCurrentMonth),
  customer_id: null,
})

const dialogCustomer = ref(false)

const report = ref<any>({
  total_invoices: 0,
  total_tm_invoices: 0,
  total_wm_invoices: 0,
  total_sea_import_tm: 0,
  total_sea_export_tm: 0,
  total_air_import_tm: 0,
  total_air_export_tm: 0,

  total_sea_import_wm: 0,
  total_sea_export_wm: 0,
  total_air_import_wm: 0,
  total_air_export_wm: 0,

  unique_customers: 0,
  customers: [],
})

const dateRangeFromTo = computed(() => {
  return {
    from: filters.value.from || null,
    to: filters.value.to || null,
  }
})

function formatServiceKey(key: string): string {
  const parts = key.replace('total_amount_', '').split('_')
  const currency = parts.pop()?.toUpperCase() || ''
  const service = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
  return `${service} (${currency})`
}

function getCurrencyFromKey(key: string): string {
  const currency = key.split('_').pop()
  return `Currency: ${currency}`
}

function correspondingPaidKey(amountKey: string): string {
  return amountKey.replace('total_amount_', 'total_paid_')
}

function getIconForService(key: string): string {
  if (key.includes('air')) return 'mdi-airplane'
  if (key.includes('sea')) return 'mdi-ferry'
  return 'mdi-cash'
}

const applyFilters = async () => {
  // Show loading indicator if needed
  try {
    loadingStore.loading = true

    // Ensure from/to are always YYYY-MM-DD strings
    const normalizeDate = (val: any) => {
      if (!val) return null
      if (typeof val === 'string') {
        // If already in YYYY-MM-DD, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
        // If ISO string, strip time
        return val.slice(0, 10)
      }
      if (val instanceof Date) {
        return val.toISOString().slice(0, 10)
      }
      return null
    }

    const queryFilters = {
      customer_id: filters.value.customer_id,
      from: normalizeDate(filters.value.from),
      to: normalizeDate(filters.value.to),
    }

    const response = await $api.dashboard.getBillingDash({
      query: {
        ...flattenArraysToCommaSeparatedString(queryFilters),
      },
    })

    report.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const clearFilters = () => {
  filters.value.from = getDateString(firstDayLastMonth)
  filters.value.to = getDateString(lastDayCurrentMonth)
  filters.value.customer_id = null
  applyFilters()
}

onMounted(() => {
  applyFilters()
})
</script>

<style scoped>
.billing-dashboard {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Filter Section */
.filter-section {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.theme--dark .filter-section {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.3px;
}

.filter-subtitle {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 2px;
}

.filter-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.87;
}

.modern-input {
  border-radius: 10px;
}

.modern-btn {
  border-radius: 10px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
}

/* Cards */
.stat-card {
  transition: all 0.3s ease;
  border-radius: 12px !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.theme--dark .stat-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}

/* Invoice Section Cards */
.invoice-section-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.theme--dark .invoice-section-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
