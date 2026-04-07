<template>
  <div class="maritime-dashboard modern-dashboard-bg">
    <!-- Professional Filter Section -->
    <v-card class="filter-section elevation-0 mb-6">
      <v-card-title class="pa-4 pb-4">
        <v-btn
          variant="text"
          color="primary"
          @click="showFilters = !showFilters"
          class="text-none font-semibold"
        >
          <v-icon start>{{ showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
        </v-btn>
      </v-card-title>
      <v-expand-transition>
        <v-card-text v-show="showFilters" class="pa-6">
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
          <v-chip color="blue-lighten-4" size="small" class="font-semibold">
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
      </v-expand-transition>
    </v-card>

    <!-- Primary Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      <v-card v-if="canViewSeaImportPrimary" class="metric-card elevation-2" @click="openStats('sea-import')">
        <div class="metric-header import-gradient">
          <div class="metric-icon-wrapper">
            <v-icon size="36" color="white">mdi-ship-wheel</v-icon>
          </div>
          <div class="metric-badge">
            <v-chip size="x-small" color="white" variant="flat" class="font-bold px-2">IMPORT</v-chip>
          </div>
        </div>
        <v-card-text class="pa-5">
          <div class="metric-value import-color">
            {{ report.total_import }}
          </div>
          <div class="metric-label">Maritime Import References</div>
          <div class="metric-trend">
            <v-icon size="14" color="success">mdi-trending-up</v-icon>
            <span class="text-xs text-success font-semibold">Active</span>
          </div>
        </v-card-text>
      </v-card>

      <v-card v-if="canViewSeaExportPrimary" class="metric-card elevation-2" @click="openStats('sea-export')">
        <div class="metric-header export-gradient">
          <div class="metric-icon-wrapper">
            <v-icon size="36" color="white">mdi-ferry</v-icon>
          </div>
          <div class="metric-badge">
            <v-chip size="x-small" color="white" variant="flat" class="font-bold px-2">EXPORT</v-chip>
          </div>
        </div>
        <v-card-text class="pa-5">
          <div class="metric-value export-color">
            {{ report.total_export }}
          </div>
          <div class="metric-label">Maritime Export References</div>
          <div class="metric-trend">
            <v-icon size="14" color="success">mdi-trending-up</v-icon>
            <span class="text-xs text-success font-semibold">Active</span>
          </div>
        </v-card-text>
      </v-card>

      <v-card v-if="canViewCustomers" class="metric-card elevation-2 cursor-pointer" @click="dialogCustomer = true">
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
          <div class="metric-label">Customers in References</div>
          <div class="metric-action">
            <v-icon size="14" color="purple">mdi-eye-outline</v-icon>
            <span class="text-xs text-purple font-semibold">View List</span>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Inline Charts - Visible by default for authorized users -->
    <div v-if="canViewCharts" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CaptureStatsInline
        title="Maritime Import Trends"
        subtitle="Daily capture statistics"
        icon="mdi-ship-wheel"
        stat-type="sea-import"
        gradient-class="from-blue-500 to-blue-700"
        chip-color="blue"
      />
      <CaptureStatsInline
        title="Maritime Export Trends"
        subtitle="Daily capture statistics"
        icon="mdi-ferry"
        stat-type="sea-export"
        gradient-class="from-teal-500 to-teal-700"
        chip-color="teal"
      />
    </div>

    <!-- Secondary Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-1 mt-6 mb-6">
      <v-card v-if="canViewArrivalNotifications" class="elevation-2 rounded-lg">
        <v-card-text class="pa-4">
          <div class="flex items-center justify-between mb-3">
            <v-icon color="red" size="32">mdi-bell-alert</v-icon>
            <v-chip size="small" color="red" variant="flat" class="text-white">Pending</v-chip>
          </div>
          <div class="text-3xl font-bold text-grey-800 dark:text-grey-200 mb-1">
            {{ report.pending_arrival_noty }}
          </div>
          <div class="text-sm text-grey-600 dark:text-grey-400">Pending Arrival Notifications</div>
          <v-divider class="my-2"></v-divider>
          <div class="text-xs text-grey-500">Maritime Import</div>
        </v-card-text>
      </v-card>

      <v-card v-if="canViewRevalidations" class="elevation-2 rounded-lg">
        <v-card-text class="pa-4">
          <div class="flex items-center justify-between mb-3">
            <v-icon color="orange" size="32">mdi-file-document-check</v-icon>
            <v-chip size="small" color="orange" variant="flat" class="text-white">Action Required</v-chip>
          </div>
          <div class="text-3xl font-bold text-grey-800 dark:text-grey-200 mb-1">
            {{ report.pending_revalidation }}
          </div>
          <div class="text-sm text-grey-600 dark:text-grey-400">Pending Revalidations</div>
          <v-divider class="my-2"></v-divider>
          <div class="text-xs text-grey-500">Maritime Import</div>
        </v-card-text>
      </v-card>

      <v-card v-if="canViewDemurrages" class="elevation-2 rounded-lg">
        <v-card-text class="pa-4">
          <div class="flex items-center justify-between mb-3">
            <v-icon color="deep-orange" size="32">mdi-timer-alert</v-icon>
            <v-chip size="small" color="deep-orange" variant="flat" class="text-white">Charges</v-chip>
          </div>
          <div class="text-3xl font-bold text-grey-800 dark:text-grey-200 mb-1">
            {{ report.import_demurrages }}
          </div>
          <div class="text-sm text-grey-600 dark:text-grey-400">Demurrage Containers</div>
          <v-divider class="my-2"></v-divider>
          <div class="text-xs text-grey-500">Amount > 0</div>
        </v-card-text>
      </v-card>

      <v-card v-if="canViewExportContainers" class="elevation-2 rounded-lg">
        <v-card-text class="pa-4">
          <div class="flex items-center justify-between mb-3">
            <v-icon color="purple" size="32">mdi-package-variant</v-icon>
            <v-chip size="small" color="purple" variant="flat" class="text-white">Export</v-chip>
          </div>
          <div class="text-3xl font-bold text-grey-800 dark:text-grey-200 mb-1">
            {{ report.total_containers_export }}
          </div>
          <div class="text-sm text-grey-600 dark:text-grey-400">Export Containers</div>
        </v-card-text>
      </v-card>

      <v-card v-if="canViewBookingConfirmations" class="elevation-2 rounded-lg">
        <v-card-text class="pa-4">
          <div class="flex items-center justify-between mb-3">
            <v-icon color="teal" size="32">mdi-check-decagram</v-icon>
            <v-chip size="small" color="teal" variant="flat" class="text-white">Confirmed</v-chip>
          </div>
          <div class="text-3xl font-bold text-grey-800 dark:text-grey-200 mb-1">
            {{ report.booking_confirmations }}
          </div>
          <div class="text-sm text-grey-600 dark:text-grey-400">Booking Confirmations</div>
        </v-card-text>
      </v-card>

      <v-card class="elevation-2 rounded-lg">
        <v-card-text class="pa-4">
          <div class="flex items-center justify-between mb-3">
            <v-icon color="indigo" size="32">mdi-package-variant-closed</v-icon>
            <v-chip size="small" color="indigo" variant="flat" class="text-white">Import</v-chip>
          </div>
          <div class="text-3xl font-bold text-grey-800 dark:text-grey-200 mb-1">
            {{ report.total_containers_import }}
          </div>
          <div class="text-sm text-grey-600 dark:text-grey-400">Import Containers</div>
        </v-card-text>
      </v-card>
    </div>


    <v-dialog v-model="dialogCustomer" max-width="700">
      <v-card>
        <v-card-title>
          <div class="flex items-center justify-between">
            <span class="text-h6">Customers ({{ report.customers?.length || 0 }})</span>
            <v-spacer />
            <v-btn icon @click="dialogCustomer = false"><v-icon icon="mdi-close" /></v-btn>
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-0">
          <v-data-table
            v-if="report.customers?.length"
            :headers="customerHeaders"
            :items="report.customers"
            :items-per-page="10"
            density="compact"
            class="elevation-0"
          >
            <template #item.name="{ item }: any">
              <span class="font-medium">{{ item.name }}</span>
            </template>
            <template #item.total_references="{ item }: any">
              <v-chip size="small" color="primary" variant="tonal">
                {{ item.total_references }}
              </v-chip>
            </template>
          </v-data-table>
          <div v-else class="text-sm text-gray-500 pa-4">No customers found.</div>
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
const { hasPermission, user: currentUser } = useCheckUser()

// Helper function to check if user has any of the specified roles
const checkUserHasAnyRole = (roles: string[]) => {
  if (!currentUser.value) return false
  return currentUser.value.roles?.some((role: any) => roles.includes(role.name)) || false
}

// Granular permission checks for each section
const canViewSeaImportPrimary = computed(() => {
  return hasPermission('dashboard-sea-import-primary') || checkUserHasAnyRole(['Super Admin', 'Admin'])
})

const canViewSeaExportPrimary = computed(() => {
  return hasPermission('dashboard-sea-export-primary') || checkUserHasAnyRole(['Super Admin', 'Admin'])
})

const canViewCustomers = computed(() => {
  return canViewSeaImportPrimary.value || canViewSeaExportPrimary.value
})

const canViewArrivalNotifications = computed(() => {
  return hasPermission('dashboard-sea-import-notifications') || checkUserHasAnyRole(['Super Admin', 'Admin'])
})

const canViewRevalidations = computed(() => {
  return hasPermission('dashboard-sea-import-revalidations') || checkUserHasAnyRole(['Super Admin', 'Admin'])
})

const canViewExportContainers = computed(() => {
  return hasPermission('dashboard-sea-export-containers') || checkUserHasAnyRole(['Super Admin', 'Admin'])
})

const canViewBookingConfirmations = computed(() => {
  return hasPermission('dashboard-sea-export-bookings') || checkUserHasAnyRole(['Super Admin', 'Admin'])
})

const canViewDemurrages = computed(() => {
  return hasPermission('dashboard-sea-import-demurrages') || checkUserHasAnyRole(['Super Admin', 'Admin'])
})

const canViewCharts = computed(() => {
  return hasPermission('dashboard-charts') || checkUserHasAnyRole(['Super Admin', 'Admin'])
})

// Check if user has ANY dashboard permission
const hasAnyDashboardPermission = computed(() => {
  return canViewSeaImportPrimary.value || 
         canViewSeaExportPrimary.value || 
         canViewArrivalNotifications.value || 
         canViewRevalidations.value || 
         canViewExportContainers.value || 
         canViewBookingConfirmations.value || 
         canViewDemurrages.value ||
         canViewCharts.value
})

// Helper to format date as YYYY-MM-DD using local date parts (avoids UTC day shift)
function formatDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Today
const today = new Date()
// First day of last month
const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
// Last day of current month
const lastDayCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

// Helper to get YYYY-MM-DD string using local date parts (avoids UTC day shift)
function getDateString(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const filters = ref<any>({
  from: getDateString(firstDayLastMonth),
  to: getDateString(lastDayCurrentMonth),
  customer_id: null,
})

const dialogCustomer = ref(false)
const showFilters = ref(false)

const customerHeaders = [
  { title: 'Customer Name', key: 'name', sortable: true },
  { title: 'Total References', key: 'total_references', sortable: true, align: 'center' as const }
]

const report = ref<any>({
  total_import: 0,
  total_export: 0,
  pending_arrival_noty: 0,
  pending_revalidation: 0,
  total_containers_import: 0,
  total_containers_export: 0,
  export_bookings: 0,
  import_demurrages: 0,
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

    const response = await $api.dashboard.getMaritimeDash({
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

const openStats = (type: string) => {
  // Charts are now inline and always visible for authorized users
  // This function is kept for backward compatibility but does nothing
}

onMounted(() => {
  applyFilters()
})
</script>

<style scoped>
.maritime-dashboard {
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
  border-radius: 8px !important;
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
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
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
  border-radius: 8px;
}

.modern-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
}

/* Metric Cards */
.metric-card {
  border-radius: 8px !important;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.theme--dark .metric-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.metric-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12) !important;
}

.metric-header {
  padding: .3rem;
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
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.export-gradient {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
}

.customer-gradient {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
}

.metric-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
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
  color: #2563eb;
}

.export-color {
  color: #0d9488;
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
  border-radius: 8px !important;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}
</style>
