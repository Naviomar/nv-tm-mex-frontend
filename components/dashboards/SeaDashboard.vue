<template>
  <div>
    <div class="p-4 bg-sky-100 dark:bg-neutral-800 rounded-lg">
      <div class="font-bold dark:text-zinc-100">Maritime Dashboard</div>
      <!-- Filters -->
      <Card class="mb-6">
        <div class="p-4">
          <div class="flex justify-between">
            <div class="w-full flex gap-4 items-end">
              <Input v-model="filters.from" label="From" type="date" />
              <Input v-model="filters.to" label="To" type="date" />
            <!-- TODO: general component -->
            <ACustomerSearch v-model="filters.customer_id" :hide-details="true" class="w-[450px]" />
            </div>
            <div class="flex gap-2 items-end">
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
          icon="mdi-ferry"
        />
        <DashboardCard
          title="Total Export"
          :value="report.total_export"
          subtitle="References"
          icon="mdi-ferry"
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
          title="Pending arrival noty"
          :value="report.pending_arrival_noty"
          subtitle="References"
          icon="mdi-bell-outline"
          icon-color="red"
        >
          <template #footer>Maritime Import</template>
        </DashboardCard>
        <DashboardCard
          title="Pending revalidation"
          :value="report.pending_revalidation"
          subtitle="References"
          icon="mdi-file-sign"
          icon-color="orange"
        >
          <template #footer>Maritime Import</template>
        </DashboardCard>
        <DashboardCard
          title="Import Containers"
          :value="report.total_containers_import"
          subtitle="Containers"
          icon="mdi-train-car-container"
        />
        <DashboardCard
          title="Export Containers"
          :value="report.total_containers_export"
          subtitle="Containers"
          icon="mdi-train-car-container"
        />
        <DashboardCard
          title="Booking confirmation"
          :value="report.export_bookings"
          subtitle="Export References"
          icon="mdi-ticket-confirmation-outline"
        />
        <DashboardCard
          title="Import demurrages"
          :value="report.import_demurrages"
          subtitle="Containers (amount > 0)"
          icon="mdi-timer-outline"
        />
      </div>
    </div>

    <!-- Customers modal -->
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
</script>
