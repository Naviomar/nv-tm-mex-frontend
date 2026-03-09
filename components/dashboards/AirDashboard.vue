<template>
  <div class="air-dashboard">
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
          <v-chip color="indigo-lighten-4" size="small" class="font-semibold">
            <v-icon start size="16">mdi-database-search</v-icon>
            {{ report.total_import + report.total_export }} Records
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

    <!-- Primary Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      <v-card class="metric-card elevation-2" @click="openStats('air-import')">
        <div class="metric-header import-gradient">
          <div class="metric-icon-wrapper">
            <v-icon size="36" color="white">mdi-airplane-landing</v-icon>
          </div>
          <div class="metric-badge">
            <v-chip size="x-small" color="white" variant="flat" class="font-bold px-2">IMPORT</v-chip>
            <v-btn icon size="x-small" variant="text" color="white">
              <v-icon size="16">mdi-chart-line</v-icon>
            </v-btn>
          </div>
        </div>
        <v-card-text class="pa-5">
          <div class="metric-value import-color">
            {{ report.total_import }}
          </div>
          <div class="metric-label">Air Import References</div>
          <div class="metric-trend">
            <v-icon size="14" color="success">mdi-trending-up</v-icon>
            <span class="text-xs text-success font-semibold">Active</span>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="metric-card elevation-2" @click="openStats('air-export')">
        <div class="metric-header export-gradient">
          <div class="metric-icon-wrapper">
            <v-icon size="36" color="white">mdi-airplane-takeoff</v-icon>
          </div>
          <div class="metric-badge">
            <v-chip size="x-small" color="white" variant="flat" class="font-bold px-2">EXPORT</v-chip>
            <v-btn icon size="x-small" variant="text" color="white">
              <v-icon size="16">mdi-chart-line</v-icon>
            </v-btn>
          </div>
        </div>
        <v-card-text class="pa-5">
          <div class="metric-value export-color">
            {{ report.total_export }}
          </div>
          <div class="metric-label">Air Export References</div>
          <div class="metric-trend">
            <v-icon size="14" color="success">mdi-trending-up</v-icon>
            <span class="text-xs text-success font-semibold">Active</span>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="metric-card elevation-2 cursor-pointer" @click="dialogCustomer = true">
        <div class="metric-header customer-gradient">
          <div class="metric-icon-wrapper">
            <v-icon size="36" color="white">mdi-account-group</v-icon>
          </div>
          <div class="metric-badge">
            <v-chip size="x-small" color="white" variant="flat" class="font-bold px-2">CLIENTS</v-chip>
          </div>
        </div>
        <v-card-text class="pa-5">
          <div class="metric-value customer-color">
            {{ report.unique_customers }}
          </div>
          <div class="metric-label">Unique Customers</div>
          <div class="metric-action">
            <v-icon size="14" color="purple">mdi-eye-outline</v-icon>
            <span class="text-xs text-purple font-semibold">View List</span>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Secondary Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <v-card class="elevation-2 rounded-lg">
        <v-card-text class="pa-4">
          <div class="flex items-center justify-between mb-3">
            <v-icon color="red" size="32">mdi-bell-alert</v-icon>
            <v-chip size="small" color="red" variant="flat" class="text-white">Pending</v-chip>
          </div>
          <div class="text-3xl font-bold text-grey-800 dark:text-grey-200 mb-1">
            {{ report.pending_notification }}
          </div>
          <div class="text-sm text-grey-600 dark:text-grey-400">Pending Notifications</div>
          <v-divider class="my-2"></v-divider>
          <div class="text-xs text-grey-500">Air Import</div>
        </v-card-text>
      </v-card>

      <v-card class="elevation-2 rounded-lg">
        <v-card-text class="pa-4">
          <div class="flex items-center justify-between mb-3">
            <v-icon color="orange" size="32">mdi-file-document-check</v-icon>
            <v-chip size="small" color="orange" variant="flat" class="text-white">Action Required</v-chip>
          </div>
          <div class="text-3xl font-bold text-grey-800 dark:text-grey-200 mb-1">
            {{ report.pending_release }}
          </div>
          <div class="text-sm text-grey-600 dark:text-grey-400">Pending Releases</div>
          <v-divider class="my-2"></v-divider>
          <div class="text-xs text-grey-500">Air Import</div>
        </v-card-text>
      </v-card>
    </div>

    <!-- CBM Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <v-card class="elevation-2 rounded-lg">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 pa-3 text-white">
          <div class="flex items-center gap-2">
            <v-icon size="28">mdi-package-variant</v-icon>
            <span class="font-semibold text-lg">Import CBM Summary</span>
          </div>
        </div>
        <v-card-text class="pa-4">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <div class="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {{ report.import_cbm_summary?.total_cbm ?? '0.00' }}
              </div>
              <div class="text-xs text-grey-600 dark:text-grey-400 font-medium">Total CBM</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {{ report.import_cbm_summary?.total_m3 ?? '0.00' }}
              </div>
              <div class="text-xs text-grey-600 dark:text-grey-400 font-medium">Total M3</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {{ report.import_cbm_summary?.total_packages ?? 0 }}
              </div>
              <div class="text-xs text-grey-600 dark:text-grey-400 font-medium">Packages</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="elevation-2 rounded-lg">
        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 pa-3 text-white">
          <div class="flex items-center gap-2">
            <v-icon size="28">mdi-package-variant-closed</v-icon>
            <span class="font-semibold text-lg">Export CBM Summary</span>
          </div>
        </div>
        <v-card-text class="pa-4">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <div class="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                {{ report.export_cbm_summary?.total_cbm ?? '0.00' }}
              </div>
              <div class="text-xs text-grey-600 dark:text-grey-400 font-medium">Total CBM</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                {{ report.export_cbm_summary?.total_m3 ?? '0.00' }}
              </div>
              <div class="text-xs text-grey-600 dark:text-grey-400 font-medium">Total M3</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                {{ report.export_cbm_summary?.total_packages ?? 0 }}
              </div>
              <div class="text-xs text-grey-600 dark:text-grey-400 font-medium">Packages</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <CaptureStatsChart
      v-model="showStatsChart"
      :title="statsConfig.title"
      :subtitle="statsConfig.subtitle"
      :icon="statsConfig.icon"
      :stat-type="statsConfig.type"
      :gradient-class="statsConfig.gradient"
      :chip-color="statsConfig.chipColor"
    />

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
  total_import: 0,
  total_export: 0,
  pending_notification: 0,
  pending_release: 0,
  unique_customers: 0,
  customers: [],
})

const dateRangeFromTo = computed(() => {
  return {
    from: filters.value.from || null,
    to: filters.value.to || null,
  }
})

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

    const response = await $api.dashboard.getAirDash({
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

const showStatsChart = ref(false)
const statsConfig = ref({
  title: '',
  subtitle: '',
  icon: '',
  type: '',
  gradient: '',
  chipColor: ''
})

const openStats = (type: string) => {
  if (type === 'air-import') {
    statsConfig.value = {
      title: 'Air Import Statistics',
      subtitle: 'Capture trends over time',
      icon: 'mdi-airplane-landing',
      type: 'air-import',
      gradient: 'from-indigo-500 to-indigo-700',
      chipColor: 'indigo'
    }
  } else {
    statsConfig.value = {
      title: 'Air Export Statistics',
      subtitle: 'Capture trends over time',
      icon: 'mdi-airplane-takeoff',
      type: 'air-export',
      gradient: 'from-cyan-500 to-cyan-700',
      chipColor: 'cyan'
    }
  }
  showStatsChart.value = true
}

onMounted(() => {
  applyFilters()
})
</script>

<style scoped>
.air-dashboard {
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
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
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

/* Metric Cards */
.metric-card {
  border-radius: 16px !important;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.metric-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12) !important;
}

.metric-header {
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.metric-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.import-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.export-gradient {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.customer-gradient {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
}

.metric-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.metric-badge {
  display: flex;
  align-items: center;
  gap: 6px;
}

.metric-value {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
  margin-bottom: 8px;
}

.import-color {
  color: #4f46e5;
}

.export-color {
  color: #0891b2;
}

.customer-color {
  color: #7c3aed;
}

.metric-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-trend,
.metric-action {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Secondary Metrics */
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
</style>
