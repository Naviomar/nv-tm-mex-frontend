<template>
  <div>
    <div class="p-4 bg-sky-100 dark:bg-neutral-800 rounded-lg">
      <div class="font-bold mb-2">Billing Dashboard</div>
      <!-- Filters -->
      <v-card class="mb-6" flat>
        <v-card-text>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="d-flex justify-center">
              <v-date-input v-model="filters.from" label="From" density="compact" hide-details />
              <v-date-input v-model="filters.to" label="To" density="compact" hide-details />
            </div>
            <ACustomerSearch v-model="filters.customer_id" :hide-details="true" />
            <div class="flex gap-2 items-center">
              <v-btn size="small" color="" variant="text" @click="clearFilters">Clear</v-btn>
              <v-btn size="small" color="primary" @click="applyFilters">Apply</v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
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
      <v-card>
        <v-card-title class="text-overline"> Customer invoices </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <v-card>
              <v-card-title class="text-overline"> Total invoices </v-card-title>
              <v-card-text>
                <div class="text-blue-darken-3 text-h3 font-weight-bold">{{ report.total_invoices }}</div>
              </v-card-text>
            </v-card>

            <v-card>
              <v-card-title class="text-overline"> TM Invoices </v-card-title>
              <v-card-text>
                <div class="text-blue-darken-3 text-h3 font-weight-bold">
                  {{ report.total_tm_invoices }}
                </div>
              </v-card-text>
            </v-card>

            <v-card>
              <v-card-title class="text-overline"> WM Invoices </v-card-title>
              <v-card-text>
                <div class="text-blue-darken-3 text-h3 font-weight-bold">
                  {{ report.total_wm_invoices }}
                </div>
              </v-card-text>
            </v-card>

            <v-card>
              <v-card-title class="text-overline"> Unique customers </v-card-title>
              <v-card-text>
                <div class="text-blue-darken-3 text-h3 font-weight-bold">
                  {{ report.unique_customers }}
                </div>
                <div class="text-xs font-bold">Customers</div>
                <!-- Icon to the right and behind -->
                <v-icon
                  icon="mdi-account-group-outline"
                  size="64"
                  class="absolute! right-4 top-1/2 -translate-y-1/2 opacity-30 z-0"
                />
                <v-btn size="x-small" variant="text" @click="dialogCustomer = true"> View list </v-btn>
              </v-card-text>
            </v-card>

            <div class="col-span-1 md:col-span-4">
              <div
                v-for="(values, currency) in report.amounts_by_currency"
                :key="currency"
                class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
              >
                <v-card>
                  <v-card-title class="text-overline"> TOTAL AMOUNT ({{ currency }}) </v-card-title>
                  <v-card-text>
                    <div class="text-blue-darken-3 text-2xl font-weight-bold">
                      {{ formatToCurrency(values.total) }}
                    </div>
                    <div class="text-xs font-bold">All Invoices in {{ currency }}</div>
                    <v-icon
                      icon="mdi-cash-multiple"
                      size="64"
                      class="absolute! right-4 top-1/2 -translate-y-1/2 opacity-10 z-0"
                    />
                  </v-card-text>
                </v-card>

                <v-card>
                  <v-card-title class="text-overline"> TOTAL PAID ({{ currency }}) </v-card-title>
                  <v-card-text>
                    <div class="text-green-darken-3 text-2xl font-weight-bold">
                      {{ formatToCurrency(values.paid) }}
                    </div>
                    <div class="text-xs font-bold">Paid Invoices in {{ currency }}</div>
                    <v-icon
                      icon="mdi-check-circle"
                      size="64"
                      class="absolute! right-4 top-1/2 -translate-y-1/2 opacity-10 z-0"
                    />
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="my-2">
        <v-card-title class="text-overline"> TM Invoices by Service </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <v-card>
              <v-card-title class="text-overline"> Maritime Import </v-card-title>
              <v-card-text>
                <div class="text-blue-darken-3 text-h3 font-weight-bold">
                  {{ report.total_sea_import_tm }}
                </div>
                <div class="text-xs font-bold"># Invoices</div>
              </v-card-text>

              <v-divider></v-divider>
            </v-card>
            <v-card>
              <v-card-title class="text-overline"> Maritime Export </v-card-title>
              <v-card-text>
                <div class="text-blue-darken-3 text-h3 font-weight-bold">
                  {{ report.total_sea_export_tm }}
                </div>
                <div class="text-xs font-bold"># Invoices</div>
              </v-card-text>

              <v-divider></v-divider>
            </v-card>

            <v-card>
              <v-card-title class="text-overline"> Air Import </v-card-title>
              <v-card-text>
                <div class="text-blue-darken-3 text-h3 font-weight-bold">
                  {{ report.total_air_import_tm }}
                </div>
                <div class="text-xs font-bold"># Invoices</div>
              </v-card-text>

              <v-divider></v-divider>
            </v-card>
            <v-card>
              <v-card-title class="text-overline"> Air Export </v-card-title>
              <v-card-text>
                <div class="text-blue-darken-3 text-h3 font-weight-bold">
                  {{ report.total_air_export_tm }}
                </div>
                <div class="text-xs font-bold"># Invoices</div>
              </v-card-text>

              <v-divider></v-divider>
            </v-card>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="my-2">
        <v-card-title class="text-overline"> WM Invoices by Service </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <v-card>
              <v-card-title class="text-overline"> Maritime Import </v-card-title>
              <v-card-text>
                <div class="text-blue-darken-3 text-h3 font-weight-bold">
                  {{ report.total_sea_import_wm }}
                </div>
                <div class="text-xs font-bold"># Invoices</div>
              </v-card-text>

              <v-divider></v-divider>
            </v-card>
            <v-card>
              <v-card-title class="text-overline"> Maritime Export </v-card-title>
              <v-card-text>
                <div class="text-blue-darken-3 text-h3 font-weight-bold">
                  {{ report.total_sea_export_wm }}
                </div>
                <div class="text-xs font-bold"># Invoices</div>
              </v-card-text>

              <v-divider></v-divider>
            </v-card>

            <v-card>
              <v-card-title class="text-overline"> Air Import </v-card-title>
              <v-card-text>
                <div class="text-blue-darken-3 text-h3 font-weight-bold">
                  {{ report.total_air_import_wm }}
                </div>
                <div class="text-xs font-bold"># Invoices</div>
              </v-card-text>

              <v-divider></v-divider>
            </v-card>
            <v-card>
              <v-card-title class="text-overline"> Air Export </v-card-title>
              <v-card-text>
                <div class="text-blue-darken-3 text-h3 font-weight-bold">
                  {{ report.total_air_export_wm }}
                </div>
                <div class="text-xs font-bold"># Invoices</div>
              </v-card-text>

              <v-divider></v-divider>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-card class="my-4">
      <v-card-title class="text-overline"> Totals by Service and Currency </v-card-title>
      <v-card-text>
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
          <v-list v-if="report.customers?.length" f density="compact">
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
  filters.value.dateRange = getDateRange(firstDayLastMonth, lastDayCurrentMonth)
  filters.value.customer_id = null
  // Optionally, refetch the dashboard data without filters
  applyFilters()
}
</script>
