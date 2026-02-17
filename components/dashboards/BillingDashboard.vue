<template>
  <div>
    <div class="p-4 bg-sky-100 dark:bg-neutral-800 rounded-lg">
      <div class="font-bold mb-2">Billing Dashboard</div>
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
      <div class="mb-4 px-2 text-sm text-zinc-600 dark:text-zinc-400">
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
      <Card class="mb-6">
        <h2 class="text-overline px-3 pt-3">Customer invoices</h2>
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DashboardCard
              title="Total invoices"
              :value="report.total_invoices"
              subtitle="Invoices"
              icon="mdi-invoice-multiple"
            />
            <DashboardCard
              title="TM Invoices"
              :value="report.total_tm_invoices"
              subtitle="Invoices"
              icon="mdi-invoice-multiple"
            />
            <DashboardCard
              title="WM Invoices"
              :value="report.total_wm_invoices"
              subtitle="Invoices"
              icon="mdi-invoice-multiple"
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

            <div class="col-span-1 md:col-span-4">
              <div
                v-for="(values, currency) in report.amounts_by_currency"
                :key="currency"
                class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
              >
                <Card class="relative">
                  <h2 class="text-overline px-3 pt-3">TOTAL AMOUNT ({{ currency }})</h2>
                  <div class="p-4">
                    <div class="text-blue-900 dark:text-blue-200 text-2xl font-bold">
                      {{ formatToCurrency(values.total) }}
                    </div>
                    <div class="text-xs font-bold">All Invoices in {{ currency }}</div>
                    <span class="mdi mdi-cash-multiple absolute right-4 top-1/2 -translate-y-1/2 text-[64px] opacity-10 z-0 text-blue-900/80 dark:text-blue-200/80" aria-hidden="true" />
                  </div>
                </Card>
                <Card class="relative">
                  <h2 class="text-overline px-3 pt-3">TOTAL PAID ({{ currency }})</h2>
                  <div class="p-4">
                    <div class="text-green-700 dark:text-green-400 text-2xl font-bold">
                      {{ formatToCurrency(values.paid) }}
                    </div>
                    <div class="text-xs font-bold">Paid Invoices in {{ currency }}</div>
                    <span class="mdi mdi-check-circle absolute right-4 top-1/2 -translate-y-1/2 text-[64px] opacity-10 z-0 text-green-700/80 dark:text-green-400/80" aria-hidden="true" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card class="my-2">
        <h2 class="text-overline px-3 pt-3">TM Invoices by Service</h2>
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DashboardCard
              title="Maritime Import"
              :value="report.total_sea_import_tm"
              subtitle="# Invoices"
              icon="mdi-ferry"
            />
            <DashboardCard
              title="Maritime Export"
              :value="report.total_sea_export_tm"
              subtitle="# Invoices"
              icon="mdi-ferry"
            />
            <DashboardCard
              title="Air Import"
              :value="report.total_air_import_tm"
              subtitle="# Invoices"
              icon="mdi-airplane"
            />
            <DashboardCard
              title="Air Export"
              :value="report.total_air_export_tm"
              subtitle="# Invoices"
              icon="mdi-airplane"
            />
          </div>
        </div>
      </Card>

      <Card class="my-2">
        <h2 class="text-overline px-3 pt-3">WM Invoices by Service</h2>
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DashboardCard
              title="Maritime Import"
              :value="report.total_sea_import_wm"
              subtitle="# Invoices"
              icon="mdi-ferry"
            />
            <DashboardCard
              title="Maritime Export"
              :value="report.total_sea_export_wm"
              subtitle="# Invoices"
              icon="mdi-ferry"
            />
            <DashboardCard
              title="Air Import"
              :value="report.total_air_import_wm"
              subtitle="# Invoices"
              icon="mdi-airplane"
            />
            <DashboardCard
              title="Air Export"
              :value="report.total_air_export_wm"
              subtitle="# Invoices"
              icon="mdi-airplane"
            />
          </div>
        </div>
      </Card>
    </div>

    <Card class="my-4">
      <h2 class="text-overline px-3 pt-3">Totals by Service and Currency</h2>
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <BillingAmountCard
            v-for="[key, value] in Object.entries(report).filter(([k]) => k.startsWith('total_amount_'))"
            :key="key"
            :title="formatServiceKey(key)"
            :subtitle="getCurrencyFromKey(key)"
            :amount="(value as number)"
            :paid="report[correspondingPaidKey(key)] ?? 0"
            :icon="getIconForService(key)"
          />
        </div>
      </div>
    </Card>

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

const today = new Date()
const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
const lastDayCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

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
  amounts_by_currency: {},
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
