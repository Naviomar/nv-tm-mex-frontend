<template>
  <div class="rebate-payments">
    <v-card>
      <v-card-title class="tm-btn-group">
        <h3>Rebate - Payment requests</h3>
        <v-spacer />
        <v-btn variant="tonal" color="primary" prepend-icon="mdi-book-open-page-variant-outline" @click="docs.open('rebate', 'payments')">How it works</v-btn>
        <v-btn variant="tonal" color="secondary" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
      </v-card-title>

      <v-card-text>
        <Can permission="rebate-summary-view">
          <!-- Status summary: each block filters the list -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <button
              v-for="card in cards"
              :key="card.key"
              type="button"
              class="summary-card text-left rounded-lg p-3"
              :class="{ 'summary-card--active': applied.status === card.key }"
              @click="toggleStatus(card.key)"
            >
              <div class="flex items-center gap-2 text-xs text-medium-emphasis">
                <v-icon size="16" :color="card.color">{{ card.icon }}</v-icon>{{ card.label }}
              </div>
              <div class="text-lg font-bold mt-1" :class="`text-${card.color}`">{{ formatToCurrency(card.total) }}</div>
              <div class="text-xs text-medium-emphasis">{{ card.count }} requests</div>
            </button>
          </div>
        </Can>

        <div class="mb-4" @keyup.enter="onClickFilters">
          <div class="font-bold mb-2">Filters</div>
          <div class="grid grid-cols-5 gap-5">
            <div><v-text-field v-model="filters.folio" density="compact" label="Folio" clearable /></div>
            <div><v-select v-model="filters.status" :items="statusItems" density="compact" label="Status" clearable /></div>
            <div><v-text-field v-model="filters.requested_by" density="compact" label="Requested by" clearable /></div>
            <div><v-text-field v-model="filters.date_from" type="date" density="compact" label="Date from" /></div>
            <div><v-text-field v-model="filters.date_to" type="date" density="compact" label="Date to" /></div>
          </div>
          <div class="flex gap-4">
            <v-btn color="secondary" @click="clearFilters">Clear</v-btn>
            <v-btn color="primary" @click="onClickFilters">Search</v-btn>
          </div>
        </div>

        <v-pagination v-model="page" :length="lastPage" rounded="circle" density="compact" />
        <v-table density="compact" fixed-header height="60vh">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Folio</th>
              <th class="text-left">Requested</th>
              <th class="text-left">Requested by</th>
              <th class="text-right">Containers</th>
              <th class="text-right">Rebate</th>
              <th class="text-left">Status</th>
              <th class="text-left">Payment reference</th>
              <th class="text-left">Paid at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in pageRows" :key="item.id" class="dark:hover:bg-gray-700 hover:bg-slate-300" :class="{ 'bg-red-100! dark:bg-red-900!': item.status === 'cancelled' }">
              <td><ViewButton :item="item" @click="open(item)" /></td>
              <td class="font-bold whitespace-nowrap">
                {{ item.folio || `#${item.id}` }}
                <v-chip v-if="item.label === 'paid_history'" size="x-small" class="ml-1" prepend-icon="mdi-history">
                  Paid outside
                  <v-tooltip activator="parent" location="top">Rebate paid by hand before this module; loaded so it is not requested again.</v-tooltip>
                </v-chip>
              </td>
              <td class="whitespace-nowrap">{{ item.requested_at ? formatDateString(item.requested_at) : '—' }}</td>
              <td>{{ item.requested_by }}</td>
              <td class="text-right">{{ item.rows }}</td>
              <td class="text-right whitespace-nowrap font-medium">{{ formatToCurrency(item.total) }}</td>
              <td>
                <v-chip size="small" :color="paymentStatus(item.status).color" :prepend-icon="paymentStatus(item.status).icon">{{ paymentStatus(item.status).label }}</v-chip>
              </td>
              <td>{{ item.payment_reference || '—' }}</td>
              <td class="whitespace-nowrap">{{ item.paid_at ? formatDateString(item.paid_at) : '—' }}</td>
            </tr>
            <tr v-if="!pageRows.length && !loading">
              <td colspan="9" class="text-center py-8 text-medium-emphasis">
                {{ batches.length ? 'No request matches the filters.' : 'No payment has been requested yet.' }}
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination v-model="page" :length="lastPage" rounded="circle" density="compact" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { paymentStatus } = useRebate()
const docs = usePageDocs()

const PER_PAGE = 25
const loading = ref(false)
const batches = ref<any[]>([])
const page = ref(1)

const blank = () => ({ folio: '', status: null as string | null, requested_by: '', date_from: '', date_to: '' })
const filters = ref(blank())
const applied = ref(blank())

const statusItems = ['requested', 'paid', 'cancelled'].map((value) => ({ value, title: paymentStatus(value).label }))

const filtered = computed(() => {
  const a = applied.value
  const text = (value: unknown) => String(value ?? '').toLowerCase()
  return batches.value.filter((batch) => {
    const day = String(batch.requested_at ?? '').slice(0, 10)
    return (
      (!a.status || batch.status === a.status) &&
      (!a.folio || text(batch.folio).includes(a.folio.toLowerCase())) &&
      (!a.requested_by || text(batch.requested_by).includes(a.requested_by.toLowerCase())) &&
      (!a.date_from || day >= a.date_from) &&
      (!a.date_to || day <= a.date_to)
    )
  })
})
const lastPage = computed(() => Math.max(Math.ceil(filtered.value.length / PER_PAGE), 1))
const pageRows = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))

const cards = computed(() =>
  ['requested', 'paid'].map((key) => {
    const subset = batches.value.filter((batch) => batch.status === key)
    const status = paymentStatus(key)
    return { key, label: status.label, color: status.color, icon: status.icon, count: subset.length, total: subset.reduce((sum, batch) => sum + Number(batch.total || 0), 0) }
  }),
)

function onClickFilters() {
  applied.value = { ...filters.value }
  page.value = 1
}
function clearFilters() {
  filters.value = blank()
  onClickFilters()
}
function toggleStatus(key: string) {
  filters.value = { ...filters.value, status: applied.value.status === key ? null : key }
  onClickFilters()
}

const open = (item: { id: number }) => navigateTo(`/rebate/payments/${item.id}`)

async function load() {
  loading.value = true
  try {
    batches.value = (await $api.rebate.getPayments()).data ?? []
  } catch {
    snackbar.add({ type: 'error', text: 'Could not load the payment requests' })
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.summary-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.summary-card:hover,
.summary-card--active {
  border-color: rgb(var(--v-theme-primary));
}
.summary-card--active {
  box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
}
</style>
