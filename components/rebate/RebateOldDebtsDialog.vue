<template>
  <v-dialog :model-value="modelValue" max-width="860" scrollable @update:model-value="emit('update:modelValue', $event)">
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
          Pending balances of references older than {{ report?.max_age_months || 12 }} months, of every customer with rebate. They are still owed, but they no longer hold the rebate.
        </div>

        <div v-if="loading" class="d-flex flex-column align-center pa-8 ga-2">
          <v-progress-circular indeterminate color="primary" />
          <span class="text-caption text-medium-emphasis">Reading the account statements of TM1 and TM2…</span>
        </div>
        <v-alert v-else-if="error" type="error" variant="tonal" density="compact">{{ error }}</v-alert>

        <template v-else-if="report">
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            label="Customer or reference"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            class="mb-3"
          />
          <div class="flex flex-wrap gap-3 mb-3">
            <div class="old-box">
              <div class="text-xs text-medium-emphasis">References</div>
              <div class="text-lg font-bold">{{ rows.length }}</div>
            </div>
            <div class="old-box">
              <div class="text-xs text-medium-emphasis">Customers</div>
              <div class="text-lg font-bold">{{ customers }}</div>
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
                <td colspan="6" class="text-center py-6 text-medium-emphasis">No old balances.</td>
              </tr>
            </tbody>
          </v-table>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { saveBlob } = useRebate()
const loading = ref(false)
const downloading = ref(false)
const error = ref('')
const report = ref<any>(null)

const search = ref('')
const rows = computed<any[]>(() => {
  const all: any[] = report.value?.rows ?? []
  const term = (search.value ?? '').trim().toLowerCase()
  return term ? all.filter((row) => `${row.customer} ${row.reference}`.toLowerCase().includes(term)) : all
})
const total = computed(() => rows.value.reduce((sum, row) => sum + Number(row.pending || 0), 0))
const customers = computed(() => new Set(rows.value.map((row) => row.customer)).size)

async function load() {
  loading.value = true
  error.value = ''
  try {
    report.value = (await $api.rebate.getOldDebts()).data
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Could not load the report'
  } finally {
    loading.value = false
  }
}

async function download() {
  downloading.value = true
  try {
    saveBlob(await $api.rebate.downloadOldDebts(), 'rebate-old-balances')
  } catch {
    snackbar.add({ type: 'error', text: 'Could not download the Excel' })
  } finally {
    downloading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open && !report.value) load()
  },
)
</script>

<style scoped>
.old-box {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 10px;
  padding: 8px 14px;
  min-width: 140px;
}
</style>
