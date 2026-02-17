<template>
  <div>
    <div class="p-4 bg-sky-100 dark:text-zinc-100 dark:bg-neutral-800 rounded-lg">
      <div class="font-bold">Air Dashboard</div>
      <!-- Filters -->
      <Card class="mb-6">
        <div class="p-4">
          <div class="flex flex-wrap items-end gap-4">
            <Input v-model="filters.from" label="From" type="date" />
            <Input v-model="filters.to" label="To" type="date" />
            <ACustomerSearch v-model="filters.customer_id" :hide-details="true" class="w-[350px]" />
            <div class="flex gap-2">
              <Button variant="ghost" size="sm" @click="clearFilters">Clear</Button>
              <Button variant="primary" size="sm" @click="applyFilters">Apply</Button>
            </div>
          </div>
        </div>
      </Card>
      <div class="mb-4 px-2 text-sm text-gray-600 dark:text-gray-300">
        <span class="font-bold">Filters applied:</span>
        <template v-if="dateRangeFromTo.from && dateRangeFromTo.to">
          <span>
            Date range:
            {{ new Date(dateRangeFromTo.from).toLocaleDateString('en-CA') }} –
            {{ new Date(dateRangeFromTo.to).toLocaleDateString('en-CA') }}
          </span>
        </template>
        <template v-if="filters.customer_id">
          <span class="ml-0"> | Customer ID: {{ filters.customer_id }} </span>
        </template>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <DashboardCard
          title="Total Import"
          :value="report.total_import"
          subtitle="References"
          icon="mdi-airplane"
        />
        <DashboardCard
          title="Total Export"
          :value="report.total_export"
          subtitle="References"
          icon="mdi-airplane"
        />
        <DashboardCard
          title="Unique customers"
          :value="report.unique_customers"
          subtitle="Customers"
          icon="mdi-account-group-outline"
        >
          <template #actions>
            <Button variant="ghost" size="sm" class="mt-2" @click="dialogCustomer = true">View list</Button>
          </template>
        </DashboardCard>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard
          title="Pending notification"
          :value="report.pending_notification"
          subtitle="References"
          icon="mdi-bell-outline"
          icon-color="red"
        >
          <template #footer>Air Import</template>
        </DashboardCard>
        <DashboardCard
          title="Pending release"
          :value="report.pending_release"
          subtitle="References"
          icon="mdi-file-sign"
          icon-color="orange"
        >
          <template #footer>Air Import</template>
        </DashboardCard>

        <Card class="relative">
          <h2 class="text-overline px-3 pt-3">Import CBM Summary</h2>
          <div class="p-4">
            <div class="text-blue-900 dark:text-blue-200 text-lg font-bold mb-2 z-10 relative">
              Total CBM: {{ report.import_cbm_summary?.total_cbm ?? '0.00' }}
            </div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">Total M3: {{ report.import_cbm_summary?.total_m3 ?? '0.00' }}</div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">Total Packages: {{ report.import_cbm_summary?.total_packages ?? 0 }}</div>
            <span class="mdi mdi-cube-outline absolute right-4 top-1/2 -translate-y-1/2 text-[64px] opacity-10 z-0 text-blue-900/80 dark:text-blue-200/80" aria-hidden="true" />
          </div>
        </Card>
        <Card class="relative">
          <h2 class="text-overline px-3 pt-3">Export CBM Summary</h2>
          <div class="p-4">
            <div class="text-blue-900 dark:text-blue-200 text-lg font-bold mb-2 z-10 relative">
              Total CBM: {{ report.export_cbm_summary?.total_cbm ?? '0.00' }}
            </div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">Total M3: {{ report.export_cbm_summary?.total_m3 ?? '0.00' }}</div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">Total Packages: {{ report.export_cbm_summary?.total_packages ?? 0 }}</div>
            <span class="mdi mdi-cube-outline absolute right-4 top-1/2 -translate-y-1/2 text-[64px] opacity-10 z-0 text-blue-900/80 dark:text-blue-200/80" aria-hidden="true" />
          </div>
        </Card>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="dialogCustomer"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="dialogCustomer = false"
      >
        <Card class="w-full max-w-[500px] max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between p-4">
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Customers ({{ report.customers?.length || 0 }})
            </h3>
            <button
              type="button"
              class="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              aria-label="Cerrar"
              @click="dialogCustomer = false"
            >
              <span class="mdi mdi-close text-lg" aria-hidden="true"></span>
            </button>
          </div>
          <div class="border-t border-zinc-200 dark:border-zinc-700" />
          <div class="p-4 overflow-y-auto flex-1">
            <ul v-if="report.customers?.length" class="space-y-2">
              <li
                v-for="(customer, index) in report.customers"
                :key="index"
                class="text-sm font-medium text-zinc-900 dark:text-zinc-100 py-1"
              >
                {{ customer.name || 'Unnamed' }}
              </li>
            </ul>
            <p v-else class="text-sm text-zinc-500 dark:text-zinc-400">No customers found.</p>
          </div>
        </Card>
      </div>
    </Teleport>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

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
  import_cbm_summary: null,
  export_cbm_summary: null,
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

function closeCustomerDialog() {
  dialogCustomer.value = false
}

onMounted(() => {
  const onEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && dialogCustomer.value) closeCustomerDialog()
  }
  window.addEventListener('keydown', onEsc)
  onUnmounted(() => window.removeEventListener('keydown', onEsc))
})
</script>
