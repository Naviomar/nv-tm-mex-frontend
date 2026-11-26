<template>
  <div class="report-container">
    <v-card elevation="0" class="report-card">
      <div class="report-header">
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <v-icon color="white" size="28">mdi-account-cash-outline</v-icon>
            </div>
            <div class="header-text">
              <h2 class="report-title">Supplier Payables</h2>
              <p class="report-subtitle">Billed, paid and pending balance per supplier, with TM1 and TM2 data</p>
            </div>
          </div>
        </div>
      </div>

      <v-card-text class="pa-6">
        <div class="filters-section">
          <div class="filters-title mb-4">
            <v-icon color="primary" size="20" class="mr-2">mdi-filter-outline</v-icon>
            <span>Report Filters</span>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="filters.supplier"
                :items="suppliers"
                item-title="name"
                item-value="key"
                label="Supplier"
                placeholder="All suppliers"
                clearable
                density="compact"
                variant="outlined"
                hide-details
                prepend-inner-icon="mdi-account-outline"
                :custom-filter="supplierFilter"
              >
                <template #item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps" :subtitle="item.raw.rfc || undefined">
                    <template #append>
                      <v-chip v-for="system in item.raw.systems" :key="system" size="x-small" label variant="tonal" :color="system === 'TM1' ? 'deep-purple' : 'primary'" class="ml-1">{{ system }}</v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="filters.status" :items="statusItems" label="Status" density="compact" variant="outlined" hide-details />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="filters.date_from" type="date" label="Invoice date from" density="compact" variant="outlined" hide-details clearable />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="filters.date_to" type="date" label="Invoice date to" density="compact" variant="outlined" hide-details clearable />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="filters.currency" :items="currencyItems" label="Currency" density="compact" variant="outlined" hide-details />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="filters.system" :items="systemItems" label="System" density="compact" variant="outlined" hide-details />
            </v-col>
          </v-row>

          <v-alert v-if="tm1Info" type="info" variant="tonal" density="compact" class="mt-4" icon="mdi-database-clock-outline">
            TM1 data is up to {{ tm1Info.as_of ? formatDateOnlyString(tm1Info.as_of) : 'an unknown date' }}
            <template v-if="tm1Info.last_payment"> (last payment applied in TM1: {{ formatDateOnlyString(tm1Info.last_payment) }})</template>.
          </v-alert>

          <div class="tm-btn-group justify-end mt-4">
            <v-btn variant="outlined" color="grey" prepend-icon="mdi-filter-off" @click="clearFilters">Clear Filters</v-btn>
            <v-btn color="success" prepend-icon="mdi-file-excel-outline" :loading="downloading" @click="download">Download Excel</v-btn>
          </div>
        </div>

        <p class="text-caption text-medium-emphasis mt-4 mb-0">
          The Excel has four sheets: Suppliers (billed / paid / pending / overdue per currency), Documents, Payments and the filters used.
          An invoice that exists in both systems is read from TM2; if only TM1 has its payment it counts as paid by TM1.
          Amounts are never added across currencies; the USD equivalent uses the exchange rate of each document date.
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const downloading = ref(false)
const suppliers = ref<any[]>([])
const tm1Info = ref<any>(null)

const blankFilters = () => ({
  supplier: null as string | null,
  status: 'all',
  date_from: `${new Date().getFullYear() - 1}-01-01` as string | null,
  date_to: null as string | null,
  currency: null as string | null,
  system: 'all',
})
const filters = ref<Record<string, any>>(blankFilters())

const statusItems = [
  { title: 'All (except cancelled)', value: 'all' },
  { title: 'Open balance', value: 'open' },
  { title: 'Overdue', value: 'overdue' },
  { title: 'Paid', value: 'paid' },
  { title: 'Partially paid', value: 'partial' },
  { title: 'Requested, not paid', value: 'requested' },
  { title: 'Pending request', value: 'pending' },
  { title: 'Cancelled in SAT', value: 'cancelled' },
]
const currencyItems = [{ title: 'All currencies', value: null }, { title: 'MXN', value: 'MXN' }, { title: 'USD', value: 'USD' }]
const systemItems = [{ title: 'TM1 + TM2', value: 'all' }, { title: 'TM2 only', value: 'tm2' }, { title: 'TM1 only (not in TM2)', value: 'tm1' }]

const supplierFilter = (_value: string, query: string, item: any) => {
  const needle = (query ?? '').toLowerCase()
  return `${item?.raw?.name ?? ''} ${item?.raw?.rfc ?? ''}`.toLowerCase().includes(needle)
}

const clearFilters = () => {
  filters.value = blankFilters()
}

async function download() {
  downloading.value = true
  try {
    const query = Object.fromEntries(Object.entries(filters.value).filter(([key, value]) => value !== null && value !== '' && !(key === 'status' && value === 'all')))
    const blob: Blob = await $api.supplierPayables.download(query)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `supplier-payables-${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch {
    snackbar.add({ type: 'error', text: 'Could not download the Excel' })
  } finally {
    downloading.value = false
  }
}

onMounted(async () => {
  try {
    const response = await $api.supplierPayables.getOptions()
    suppliers.value = response.data.suppliers ?? []
    tm1Info.value = response.data.tm1 ?? null
  } catch {
    snackbar.add({ type: 'error', text: 'Could not load the supplier list' })
  }
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
  background: linear-gradient(135deg, #546e7a 0%, #37474f 100%);
  position: relative;
  overflow: hidden;
}
.header-content {
  position: relative;
  z-index: 1;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.icon-wrapper {
  background: rgba(255, 255, 255, 0.15);
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
</style>
