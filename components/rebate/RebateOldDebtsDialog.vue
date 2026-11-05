<template>
  <v-dialog :model-value="modelValue" max-width="960" scrollable @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-history</v-icon>
        Old balances
        <v-spacer />
        <v-btn variant="tonal" color="success" size="small" prepend-icon="mdi-file-excel-outline" :loading="downloading" :disabled="!report?.rows?.length" @click="download">Excel</v-btn>
        <v-btn icon="mdi-close" variant="text" size="small" @click="emit('update:modelValue', false)" />
      </v-card-title>

      <v-card-text>
        <div class="text-body-2 text-medium-emphasis mb-3">
          Pending balances of references older than {{ report?.max_age_months || 12 }} months, of the customers with rebate. They are still owed, but they no longer hold the rebate.
        </div>

        <!-- Own form: nothing is read until Search -->
        <v-form @submit.prevent="search">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-3">
            <v-autocomplete v-model="filters.consignee_id" :items="customers" item-title="name" item-value="id" density="compact" label="Customer" clearable />
            <v-autocomplete v-model="filters.executive_id" :items="executives" item-title="name" item-value="id" density="compact" label="Executive" clearable />
            <v-select v-model="filters.system" :items="systemItems" density="compact" label="System" clearable />
            <v-text-field v-model="filters.search" density="compact" label="Customer or reference" prepend-inner-icon="mdi-magnify" clearable />
            <v-text-field v-model="filters.date_from" type="date" density="compact" label="Date from" />
            <v-text-field v-model="filters.date_to" type="date" density="compact" label="Date to" />
          </div>
          <div class="tm-btn-group mb-3">
            <v-btn type="submit" color="primary" prepend-icon="mdi-magnify" :loading="loading">Search</v-btn>
            <v-btn variant="tonal" prepend-icon="mdi-filter-remove-outline" :disabled="loading" @click="clear">Clear</v-btn>
            <span v-if="!hasFilters" class="text-caption text-medium-emphasis">Without filters it reads every customer and can take a while.</span>
          </div>
        </v-form>

        <div v-if="loading" class="d-flex flex-column align-center pa-8 ga-2">
          <v-progress-circular indeterminate color="primary" />
          <span class="text-caption text-medium-emphasis">Reading the account statements of TM1 and TM2…</span>
        </div>
        <v-alert v-else-if="error" type="error" variant="tonal" density="compact">{{ error }}</v-alert>
        <div v-else-if="!report" class="text-center py-8 text-medium-emphasis">Use the filters and press Search.</div>

        <template v-else>
          <div class="flex flex-wrap gap-3 mb-3">
            <div class="old-box">
              <div class="text-xs text-medium-emphasis">References</div>
              <div class="text-lg font-bold">{{ rows.length }}</div>
            </div>
            <div class="old-box">
              <div class="text-xs text-medium-emphasis">Customers</div>
              <div class="text-lg font-bold">{{ customerCount }}</div>
            </div>
            <div class="old-box">
              <div class="text-xs text-medium-emphasis">Total pending</div>
              <div class="text-lg font-bold">{{ formatToCurrency(total) }}</div>
            </div>
          </div>

          <v-table density="compact" fixed-header :height="rows.length > 12 ? '50vh' : undefined">
            <thead>
              <tr>
                <th class="text-left">Customer</th>
                <th class="text-left">System</th>
                <th class="text-left">Reference</th>
                <th class="text-left">Date</th>
                <th class="text-right">Months old</th>
                <th class="text-right">Pending</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.system + row.reference">
                <td>{{ row.customer }}</td>
                <td>{{ row.system }}</td>
                <td class="font-medium whitespace-nowrap">{{ row.reference }}</td>
                <td class="whitespace-nowrap">{{ row.date }}</td>
                <td class="text-right">{{ row.months }}</td>
                <td class="text-right whitespace-nowrap">{{ formatToCurrency(row.pending) }}</td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="6" class="text-center py-6 text-medium-emphasis">No old balances with these filters.</td>
              </tr>
            </tbody>
          </v-table>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; executives: any[]; customers: any[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { saveBlob } = useRebate()
const loading = ref(false)
const downloading = ref(false)
const error = ref('')
const report = ref<any>(null)

const systemItems = [{ title: 'TM1', value: 'tm1' }, { title: 'TM2', value: 'tm2' }]
const blankFilters = () => ({
  consignee_id: null as number | null,
  executive_id: null as number | null,
  system: null as string | null,
  search: '' as string | null,
  date_from: '',
  date_to: '',
})
const filters = ref(blankFilters())
// `applied` is what the table and the Excel use: it only changes with Search.
const applied = ref<Record<string, any>>({})

const query = (values: Record<string, any>) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== ''))
const hasFilters = computed(() => Object.keys(query(filters.value)).length > 0)

const rows = computed<any[]>(() => report.value?.rows ?? [])
const total = computed(() => rows.value.reduce((sum, row) => sum + Number(row.pending || 0), 0))
const customerCount = computed(() => new Set(rows.value.map((row) => row.customer)).size)

async function search() {
  applied.value = query(filters.value)
  loading.value = true
  error.value = ''
  try {
    report.value = (await $api.rebate.getOldDebts(applied.value)).data
  } catch (e: any) {
    report.value = null
    error.value = e?.data?.message ?? 'Could not load the report'
  } finally {
    loading.value = false
  }
}

function clear() {
  filters.value = blankFilters()
  applied.value = {}
  report.value = null
  error.value = ''
}

async function download() {
  downloading.value = true
  try {
    saveBlob(await $api.rebate.downloadOldDebts(applied.value), 'rebate-old-balances')
  } catch {
    snackbar.add({ type: 'error', text: 'Could not download the Excel' })
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.old-box {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 10px;
  padding: 8px 14px;
  min-width: 140px;
}
</style>
