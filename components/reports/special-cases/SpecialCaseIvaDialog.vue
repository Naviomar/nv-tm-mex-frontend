<template>
  <v-dialog :model-value="modelValue" max-width="1400" scrollable @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-percent-outline</v-icon>
        Demurrage with IVA
        <v-spacer />
        <v-btn variant="outlined" size="small" prepend-icon="mdi-file-excel-outline" :loading="downloading" :disabled="!rows.length" @click="download">Excel</v-btn>
        <v-btn icon="mdi-close" variant="text" size="small" @click="emit('update:modelValue', false)" />
      </v-card-title>
      <v-card-text>
        <div v-if="loading" class="d-flex justify-center pa-10"><v-progress-circular indeterminate color="primary" /></div>
        <v-alert v-else-if="error" type="error" variant="tonal">{{ error }}</v-alert>
        <template v-else>
          <v-row dense class="mb-3">
            <v-col v-for="card in cards" :key="card.label" cols="6" md="3">
              <v-sheet class="tm-panel pa-3 rounded-lg" border>
                <div class="text-caption text-medium-emphasis">{{ card.label }}</div>
                <div class="text-h6 font-weight-bold">{{ card.money ? formatCurrency(card.value) : card.value }}</div>
              </v-sheet>
            </v-col>
          </v-row>
          <v-data-table :headers="headers" :items="rows" density="compact" :items-per-page="25" hover class="text-no-wrap">
            <template v-for="key in moneyKeys" #[`item.${key}`]="{ item }" :key="key">{{ formatCurrency(item[key]) }}</template>
            <template #no-data>No demurrage with IVA in the special cases.</template>
          </v-data-table>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { formatCurrency } = useReportFormatters()
const { saveBlob } = useRebate()

const loading = ref(false)
const downloading = ref(false)
const error = ref('')
const rows = ref<any[]>([])
const summary = ref<any>(null)

const moneyKeys = ['subtotal', 'iva', 'discount', 'total', 'covered', 'pending', 'iva_covered', 'iva_pending']
const headers = ([
  { title: 'Case', key: 'case' },
  { title: 'Reference', key: 'reference' },
  { title: 'Container', key: 'container' },
  { title: 'Subtotal', key: 'subtotal', align: 'end' as const },
  { title: 'IVA', key: 'iva', align: 'end' as const },
  { title: 'Discount', key: 'discount', align: 'end' as const },
  { title: 'Total', key: 'total', align: 'end' as const },
  { title: 'Covered', key: 'covered', align: 'end' as const },
  { title: 'Pending', key: 'pending', align: 'end' as const },
  { title: 'IVA covered', key: 'iva_covered', align: 'end' as const },
  { title: 'IVA pending', key: 'iva_pending', align: 'end' as const },
] as any[]).map((header) => ({ ...header, nowrap: true }))
const cards = computed(() => [
  { label: 'Containers with IVA', value: summary.value?.containers ?? 0, money: false },
  { label: 'Total with IVA', value: summary.value?.total ?? 0, money: true },
  { label: 'IVA in total', value: summary.value?.iva ?? 0, money: true },
  { label: 'IVA still pending', value: summary.value?.iva_pending ?? 0, money: true },
])

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await $api.specialCases.getIva()
    rows.value = data.rows
    summary.value = data.summary
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Could not load the report'
  } finally {
    loading.value = false
  }
}

async function download() {
  downloading.value = true
  try {
    saveBlob(await $api.specialCases.downloadIva(), 'special-cases-iva')
  } catch {
    snackbar.add({ type: 'error', text: 'Could not download the Excel' })
  } finally {
    downloading.value = false
  }
}

watch(() => props.modelValue, (open) => open && load())
</script>
