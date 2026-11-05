<template>
  <div class="report-container">
    <v-card elevation="0" class="report-card">
      <div class="report-header">
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <v-icon color="white" size="28">mdi-clock-alert-outline</v-icon>
            </div>
            <div class="header-text">
              <h2 class="report-title">Demurrage</h2>
              <p class="report-subtitle">
                {{ total.toLocaleString() }} containers · {{ rangeLabel }}<template v-if="options.restricted"> · your executives and team</template>
              </p>
            </div>
          </div>
          <div class="header-actions">
            <v-btn variant="flat" color="white" size="small" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
            <v-btn variant="flat" color="white" size="small" prepend-icon="mdi-file-excel-outline" :loading="downloading" @click="download">Excel</v-btn>
          </div>
        </div>
      </div>

      <v-card-text class="pa-6">
        <v-alert v-for="warning in warnings" :key="warning" type="warning" variant="tonal" density="compact" class="mb-3">{{ warning }}</v-alert>

        <Can permission="reports-demurrage-detention-view-totals">
          <!-- Summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <div v-for="card in cards" :key="card.label" class="summary-card rounded-lg p-3">
              <div class="flex items-center text-xs text-medium-emphasis mb-1">
                <v-chip v-if="card.system" size="x-small" label variant="tonal" :color="card.system === 'TM1' ? 'deep-purple' : 'primary'" class="mr-2">{{ card.system }}</v-chip>
                {{ card.label }}
              </div>
              <div class="flex flex-wrap gap-6">
                <div><div class="text-xs text-medium-emphasis">Containers</div><strong>{{ card.data.containers.toLocaleString() }}</strong></div>
                <template v-if="earnings">
                  <div><div class="text-xs text-medium-emphasis">Total</div><strong>{{ formatToCurrency(card.data.total) }}</strong></div>
                  <div><div class="text-xs text-medium-emphasis">Paid</div><strong class="text-success">{{ formatToCurrency(card.data.paid) }}</strong></div>
                </template>
                <div><div class="text-xs text-medium-emphasis">Pending</div><strong :class="card.data.difference > 0 ? 'text-warning' : ''">{{ formatToCurrency(card.data.difference) }}</strong></div>
              </div>
            </div>
          </div>
        </Can>

        <!-- Filters -->
        <div class="filters-section mb-5" @keyup.enter="onSearch">
          <div class="filters-title mb-4">
            <v-icon color="primary" size="20" class="mr-2">mdi-filter-outline</v-icon>
            <span>Report Filters</span>
          </div>

          <div class="tm-btn-group mb-4">
            <v-btn-toggle v-model="view" mandatory density="comfortable" color="primary" variant="outlined" divided>
              <v-btn v-for="item in viewItems" :key="item.value" :value="item.value" size="small" class="text-none" :prepend-icon="item.icon">{{ item.title }}</v-btn>
            </v-btn-toggle>
            <v-btn-toggle :model-value="order" density="comfortable" color="primary" variant="outlined" divided @update:model-value="setOrder">
              <v-btn value="desc" size="small" class="text-none" prepend-icon="mdi-sort-calendar-descending">Newest first</v-btn>
              <v-btn value="asc" size="small" class="text-none" prepend-icon="mdi-sort-calendar-ascending">Oldest first</v-btn>
            </v-btn-toggle>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <v-select v-model="filters.year_from" :items="yearItems" label="From year" density="compact" variant="outlined" hide-details />
            <v-select v-model="filters.year_to" :items="yearItems" label="To year" density="compact" variant="outlined" hide-details />
            <v-text-field v-model="filters.search" label="Reference or container" prepend-inner-icon="mdi-magnify" clearable density="compact" variant="outlined" hide-details />
            <v-select v-model="filters.calc" :items="calcItems" label="Calculation" clearable density="compact" variant="outlined" hide-details />
            <v-autocomplete
              v-model="filters.consignee_id"
              v-model:search="customerSearch"
              :items="customers"
              item-title="name"
              item-value="id"
              label="Customer"
              clearable
              no-filter
              density="compact"
              variant="outlined"
              hide-details
            />
            <v-autocomplete v-model="filters.consignee_group_id" :items="options.groups" item-title="name" item-value="id" label="Customer group" clearable density="compact" variant="outlined" hide-details />
            <v-autocomplete v-model="filters.executive_id" :items="options.executives" item-title="name" item-value="id" label="Executive" clearable density="compact" variant="outlined" hide-details />
            <div class="grid grid-cols-2 gap-4">
              <v-select v-model="filters.source" :items="sourceItems" label="System" density="compact" variant="outlined" hide-details />
              <v-select v-model="filters.type" :items="typeItems" label="Type" density="compact" variant="outlined" hide-details />
            </div>
          </div>

          <div class="tm-btn-group justify-end mt-4">
            <v-btn variant="outlined" color="grey" prepend-icon="mdi-filter-off" @click="clearFilters">Clear Filters</v-btn>
            <v-btn color="primary" prepend-icon="mdi-magnify" :loading="loading" @click="onSearch">Search</v-btn>
          </div>
        </div>

        <!-- Table -->
        <v-pagination v-model="page" :length="lastPage" rounded="circle" density="compact" :total-visible="7" @update:model-value="load" />
        <v-table density="compact" fixed-header height="60vh">
          <thead>
            <tr>
              <th v-for="header in headers" :key="header.key" :class="header.align === 'end' ? 'text-right' : 'text-left'">
                <span v-if="header.sortable !== false" class="sortable" @click="toggleSort(header.key)">
                  {{ header.title }}
                  <v-icon size="14">{{ sortIcon(header.key) }}</v-icon>
                </span>
                <span v-else>{{ header.title }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in rows" :key="`${item.system}-${item.reference}-${item.container}-${item.type}-${index}`" class="dark:hover:bg-gray-700 hover:bg-slate-300">
              <td><v-chip size="x-small" label variant="tonal" :color="item.system === 'TM1' ? 'deep-purple' : 'primary'">{{ item.system }}</v-chip></td>
              <td><v-chip size="x-small" label variant="outlined" :color="item.type === 'Detention' ? 'teal' : 'orange'">{{ item.type }}</v-chip></td>
              <td class="whitespace-nowrap font-medium">{{ item.reference }}</td>
              <td class="max-w-64 truncate" :title="item.customer">{{ item.customer }}</td>
              <td class="whitespace-nowrap">{{ item.executive }}</td>
              <td class="max-w-48 truncate" :title="item.line">{{ item.line }}</td>
              <td class="whitespace-nowrap">{{ item.container }}</td>
              <td>{{ item.container_type }}</td>
              <td class="whitespace-nowrap">{{ item.etd }}</td>
              <td>{{ item.status }}</td>
              <td class="text-right">{{ item.free_days }}</td>
              <td class="whitespace-nowrap">{{ item.last_free_day }}</td>
              <td class="whitespace-nowrap">
                <span v-if="item.empty_date">{{ item.empty_date }}</span>
                <span v-else-if="item.type === 'Detention'" class="text-medium-emphasis">—</span>
                <v-chip v-else size="x-small" label color="error" variant="tonal" prepend-icon="mdi-calendar-remove-outline">Missing</v-chip>
              </td>
              <td class="text-right">{{ item.demurrage_days }}</td>
              <td v-if="earnings" class="text-right whitespace-nowrap">{{ formatToCurrency(item.total) }}</td>
              <td v-if="earnings" class="text-right whitespace-nowrap">{{ formatToCurrency(item.paid + item.covered) }}</td>
              <td class="text-right whitespace-nowrap">
                <strong :class="item.difference > 0.005 ? 'text-warning' : 'text-success'">{{ formatToCurrency(item.difference) }}</strong>
              </td>
              <td>{{ [...item.invoices_tm, ...item.invoices_wm].join(', ') }}</td>
            </tr>
            <tr v-if="!rows.length && !loading">
              <td :colspan="headers.length" class="text-center py-8 text-medium-emphasis">No containers for these filters.</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination v-model="page" :length="lastPage" rounded="circle" density="compact" :total-visible="7" @update:model-value="load" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const currentYear = new Date().getFullYear()
const DEFAULT_FROM_YEAR = 2024
const PER_PAGE = 50

const loading = ref(false)
const downloading = ref(false)
const rows = ref<any[]>([])
const total = ref(0)
const summary = ref<any>(null)
const warnings = ref<string[]>([])
const earnings = ref(true)
const page = ref(1)
const sort = ref<{ key: string; order: 'asc' | 'desc' }>({ key: 'etd', order: 'desc' })
const options = reactive<{ executives: any[]; groups: any[]; restricted: boolean }>({ executives: [], groups: [], restricted: false })
const customers = ref<any[]>([])
const customerSearch = ref('')
const view = ref<'all' | 'pending' | 'paid' | 'no_empty_date'>('pending')

const blankFilters = () => ({
  year_from: DEFAULT_FROM_YEAR as number | null,
  year_to: currentYear as number | null,
  source: 'all',
  type: 'all',
  calc: null as string | null,
  search: null as string | null,
  consignee_id: null as number | null,
  consignee_group_id: null as number | null,
  executive_id: null as number | null,
})
// `filters` is what the form edits; `applied` is what the table uses (changes with Search, like the other reports).
const filters = ref<Record<string, any>>(blankFilters())
const applied = ref<Record<string, any>>(blankFilters())

// null = no limit on that side
const yearItems = [{ title: 'Any', value: null }, ...Array.from({ length: currentYear - 2012 }, (_, i) => currentYear - i).map((year) => ({ title: String(year), value: year }))]
const sourceItems = [{ title: 'TM1 + TM2', value: 'all' }, { title: 'TM1 only', value: 'tm1' }, { title: 'TM2 only', value: 'tm2' }]
const typeItems = [{ title: 'Demurrage + detention', value: 'all' }, { title: 'Demurrage', value: 'demurrage' }, { title: 'Detention (TM2)', value: 'detention' }]
const calcItems = [{ title: 'Total', value: 'TOTAL' }, { title: 'Partial', value: 'PARCIAL' }]

// Who only follows up the pending balance does not get the paid / earned views.
const allViewItems = [
  { value: 'pending', title: 'Pending', icon: 'mdi-clock-alert-outline', earned: false },
  { value: 'no_empty_date', title: 'No empty date', icon: 'mdi-calendar-remove-outline', earned: false },
  { value: 'paid', title: 'Paid', icon: 'mdi-check-circle-outline', earned: true },
  { value: 'all', title: 'All', icon: 'mdi-format-list-bulleted', earned: true },
]
const viewItems = computed(() => allViewItems.filter((item) => earnings.value || !item.earned))

const order = computed(() => (sort.value.key === 'etd' ? sort.value.order : null))
const setOrder = (value: 'asc' | 'desc' | null) => {
  sort.value = { key: 'etd', order: value ?? 'desc' }
  page.value = 1
  load()
}

const rangeLabel = computed(() => {
  const from = applied.value.year_from
  const to = applied.value.year_to
  if (!from && !to) return 'all years'
  return from === to ? String(from) : `${from ?? 'start'} – ${to ?? 'today'}`
})

const baseHeaders = [
  { title: 'System', key: 'system', sortable: false },
  { title: 'Type', key: 'type', sortable: false },
  { title: 'Reference', key: 'reference' },
  { title: 'Customer', key: 'customer' },
  { title: 'Executive', key: 'executive' },
  { title: 'Line', key: 'line', sortable: false },
  { title: 'Container', key: 'container' },
  { title: 'Size', key: 'container_type', sortable: false },
  { title: 'Date', key: 'etd' },
  { title: 'Calculation', key: 'status', sortable: false },
  { title: 'Free days', key: 'free_days', align: 'end' as const },
  { title: 'Last free day', key: 'last_free_day', sortable: false },
  { title: 'Empty return', key: 'empty_date' },
  { title: 'Days', key: 'demurrage_days', align: 'end' as const, sortable: false },
  { title: 'Total', key: 'total', align: 'end' as const, earned: true },
  { title: 'Paid', key: 'paid', align: 'end' as const, sortable: false, earned: true },
  { title: 'Pending', key: 'difference', align: 'end' as const },
  { title: 'Invoices', key: 'invoices', sortable: false },
] as { title: string; key: string; align?: 'end'; sortable?: boolean; earned?: boolean }[]
const headers = computed(() => baseHeaders.filter((header) => earnings.value || !header.earned))

const sortIcon = (key: string) => (sort.value.key === key ? (sort.value.order === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down') : 'mdi-unfold-more-horizontal')
function toggleSort(key: string) {
  sort.value = { key, order: sort.value.key === key && sort.value.order === 'desc' ? 'asc' : 'desc' }
  page.value = 1
  load()
}

const lastPage = computed(() => Math.max(Math.ceil(total.value / PER_PAGE), 1))

const emptySummary = { containers: 0, total: 0, paid: 0, difference: 0 }
const cards = computed(() => [
  { label: 'Containers', system: 'TM1', data: { ...emptySummary, ...(summary.value?.TM1 ?? {}) } },
  { label: 'Containers', system: 'TM2', data: { ...emptySummary, ...(summary.value?.TM2 ?? {}) } },
  { label: 'Both systems', system: '', data: { ...emptySummary, ...(summary.value?.all ?? {}) } },
])

const query = () => {
  const { year_from, year_to, ...rest } = applied.value
  return {
    ...Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== null && value !== '')),
    ...(year_from ? { date_from: `${year_from}-01-01` } : {}),
    ...(year_to ? { date_to: `${year_to}-12-31` } : {}),
    ...(view.value === 'no_empty_date' ? { no_empty_date: 1 } : view.value === 'all' ? {} : { status: view.value }),
    sort_by: sort.value.key,
    sort_dir: sort.value.order,
  }
}

async function load() {
  loading.value = true
  try {
    const response = await $api.demurrageDetention.getReport({ ...query(), page: page.value, per_page: PER_PAGE })
    rows.value = response.data.rows
    total.value = response.data.total
    summary.value = response.data.summary
    warnings.value = response.data.warnings ?? []
    earnings.value = response.data.earnings !== false
    if (!earnings.value && !viewItems.value.some((item) => item.value === view.value)) view.value = 'pending'
  } catch {
    snackbar.add({ type: 'error', text: 'Could not load the demurrage report' })
  } finally {
    loading.value = false
  }
}

function onSearch() {
  applied.value = { ...filters.value }
  page.value = 1
  load()
}

function clearFilters() {
  filters.value = blankFilters()
  onSearch()
}

async function download() {
  downloading.value = true
  try {
    const blob: Blob = await $api.demurrageDetention.download(query())
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `demurrage-${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch {
    snackbar.add({ type: 'error', text: 'Could not download the Excel' })
  } finally {
    downloading.value = false
  }
}

let customerTimer: ReturnType<typeof setTimeout> | undefined
watch(customerSearch, (term) => {
  clearTimeout(customerTimer)
  customerTimer = setTimeout(async () => {
    try {
      customers.value = (await $api.demurrageDetention.searchCustomers(term ?? '')).data ?? []
    } catch {
      customers.value = []
    }
  }, 300)
})

// The quick views apply right away; the rest of the filters wait for Search.
watch(view, () => {
  page.value = 1
  load()
})

onMounted(async () => {
  try {
    Object.assign(options, (await $api.demurrageDetention.getOptions()).data)
    customers.value = (await $api.demurrageDetention.searchCustomers('')).data ?? []
  } catch {
    snackbar.add({ type: 'error', text: 'Could not load the filters' })
  }
  load()
})
</script>

<style scoped>
.report-container {
  width: 100%;
}
.report-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  overflow: hidden;
}
.report-header {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  position: relative;
  overflow: hidden;
}
.report-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 40%;
  height: 200%;
  background: rgba(255, 255, 255, 0.05);
  transform: rotate(-15deg);
}
.header-content {
  position: relative;
  z-index: 1;
  padding: 20px 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header-actions {
  display: flex;
  gap: 8px;
}
.icon-wrapper {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-text {
  color: white;
}
.report-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}
.report-subtitle {
  margin: 4px 0 0;
  opacity: 0.9;
  font-size: 0.9rem;
}
.filters-title {
  display: flex;
  align-items: center;
  font-weight: 600;
}
.summary-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
}
.sortable {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
</style>
