<template>
  <div>
    <div class="p-4 bg-sky-100 dark:bg-neutral-800 rounded-lg">
      <div class="font-bold">Maritime Dashboard</div>
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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <v-card>
          <v-card-title class="text-overline"> Total Import </v-card-title>
          <v-card-text>
            <!-- Number in front -->
            <div class="text-blue-darken-3 text-h3 font-weight-bold z-10 relative">
              {{ report.total_import }}
            </div>
            <div class="text-xs font-bold">References</div>

            <!-- Icon to the right and behind -->
            <v-icon icon="mdi-ferry" size="64" class="absolute! right-4 top-1/2 -translate-y-1/2 opacity-30 z-0" />
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title class="text-overline"> Total Export </v-card-title>
          <v-card-text>
            <div class="text-blue-darken-3 text-h3 font-weight-bold">
              {{ report.total_export }}
            </div>
            <div class="text-xs font-bold">References</div>
            <!-- Icon to the right and behind -->
            <v-icon icon="mdi-ferry" size="64" class="absolute! right-4 top-1/2 -translate-y-1/2 opacity-30 z-0" />
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
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <v-card>
          <v-card-title class="text-overline"> Pending arrival noty </v-card-title>
          <v-card-text>
            <div class="text-blue-darken-3 text-h3 font-weight-bold">
              {{ report.pending_arrival_noty }}
            </div>
            <div class="text-xs font-bold">References</div>
          </v-card-text>
          <!-- Icon to the right and behind -->
          <v-icon
            icon="mdi-bell-outline"
            color="red"
            size="64"
            class="absolute! right-4 top-1/2 -translate-y-1/2 opacity-30 z-0"
          />

          <v-divider></v-divider>

          <div class="px-4 text-xs">Maritime Import</div>
        </v-card>
        <v-card>
          <v-card-title class="text-overline"> Pending revalidation </v-card-title>
          <v-card-text>
            <div class="text-blue-darken-3 text-h3 font-weight-bold">
              {{ report.pending_revalidation }}
            </div>
            <div class="text-xs font-bold">References</div>
          </v-card-text>

          <v-divider></v-divider>
          <!-- Icon to the right and behind -->
          <v-icon
            icon="mdi-file-sign"
            color="orange"
            size="64"
            class="absolute! right-4 top-1/2 -translate-y-1/2 opacity-30 z-0"
          />

          <div class="px-4 text-xs">Maritime Import</div>
        </v-card>

        <v-card>
          <v-card-title class="text-overline"> Import Containers </v-card-title>
          <v-card-text>
            <div class="text-blue-darken-3 text-h3 font-weight-bold">
              {{ report.total_containers_import }}
            </div>
            <div class="text-xs font-bold">Containers</div>
          </v-card-text>

          <v-divider></v-divider>
          <!-- Icon to the right and behind -->
          <v-icon
            icon="mdi-train-car-container"
            size="64"
            class="absolute! right-4 top-1/2 -translate-y-1/2 opacity-30 z-0"
          />
        </v-card>

        <v-card>
          <v-card-title class="text-overline"> Export Containers </v-card-title>
          <v-card-text>
            <div class="text-blue-darken-3 text-h3 font-weight-bold">
              {{ report.total_containers_export }}
            </div>
            <div class="text-xs font-bold">Containers</div>
          </v-card-text>

          <v-divider></v-divider>
          <!-- Icon to the right and behind -->
          <v-icon
            icon="mdi-train-car-container"
            size="64"
            class="absolute! right-4 top-1/2 -translate-y-1/2 opacity-30 z-0"
          />
        </v-card>

        <v-card>
          <v-card-title class="text-overline"> Booking confirmation </v-card-title>
          <v-card-text>
            <div class="text-blue-darken-3 text-h3 font-weight-bold">
              {{ report.export_bookings }}
            </div>
            <div class="text-xs font-bold">Export References</div>
          </v-card-text>

          <v-divider></v-divider>
          <!-- Icon to the right and behind -->
          <v-icon
            icon="mdi-ticket-confirmation-outline"
            size="64"
            class="absolute! right-4 top-1/2 -translate-y-1/2 opacity-30 z-0"
          />
        </v-card>

        <v-card>
          <v-card-title class="text-overline"> Import demurrages </v-card-title>
          <v-card-text>
            <div class="text-blue-darken-3 text-h3 font-weight-bold">
              {{ report.import_demurrages }}
            </div>
            <div class="text-xs font-bold">Containers (amount > 0)</div>
          </v-card-text>

          <v-divider></v-divider>
          <!-- Icon to the right and behind -->
          <v-icon
            icon="mdi-timer-outline"
            size="64"
            class="absolute! right-4 top-1/2 -translate-y-1/2 opacity-30 z-0"
          />
        </v-card>
      </div>
    </div>

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

const filters = ref<any>({
  from: getDateString(firstDayLastMonth),
  to: getDateString(lastDayCurrentMonth),
  customer_id: null,
})

const dialogCustomer = ref(false)

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
