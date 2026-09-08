<template>
  <v-dialog :model-value="modelValue" max-width="1000" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-toolbar density="compact" color="transparent" flat>
        <v-icon class="ml-4" size="small">mdi-file-clock-outline</v-icon>
        <v-toolbar-title class="text-body-1 font-weight-bold pa-0">
          Pending references (payment request without line invoice)
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon="mdi-microsoft-excel"
          variant="text"
          size="small"
          color="green-darken-1"
          :disabled="loading || items.length === 0"
          title="Export to Excel"
          @click="exportToExcel"
        />
        <v-btn icon variant="text" size="small" title="Close" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-alert type="info" variant="tonal" density="compact" class="mb-3 text-caption">
          References/Master BL(s) with an active payment request (Payment Release) that still don't have a
          freight line invoice loaded. Click a row to add its Master BL to the search.
        </v-alert>

        <div v-if="loading" class="flex justify-center py-6">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <v-table v-else density="compact" fixed-header height="450">
          <thead>
            <tr>
              <th class="text-left">Reference #</th>
              <th class="text-left">Master BL</th>
              <th class="text-left">Freight line</th>
              <th class="text-left">Payment Release</th>
              <th class="text-left">Amount</th>
              <th class="text-left">Created at</th>
              <th class="text-left" width="20"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="`pending-ref-${index}`">
              <td>{{ item.referencia?.reference_number }}</td>
              <td>{{ item.ref_master_bl?.name }}</td>
              <td>{{ item.schedule?.line?.name }}</td>
              <td>{{ item.schedule?.folio || '#' + item.schedule?.id }}</td>
              <td class="whitespace-nowrap">
                {{ getCurrencyName(item.currency_id) }} {{ formatToCurrency(item.amount) }}
              </td>
              <td class="whitespace-nowrap">{{ formatDateString(item.created_at) }}</td>
              <td>
                <v-btn
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  :disabled="!item.ref_master_bl?.name"
                  @click="selectItem(item)"
                >
                  <v-icon start size="small">mdi-plus</v-icon> Use
                </v-btn>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="7" class="text-center text-grey-darken-1 py-4">
                No pending references found{{ lineId ? ' for this freight line' : '' }}.
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="secondary" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { exportTableToExcel } = useExcelExport()

const props = defineProps<{
  modelValue: boolean
  lineId?: string | number | null
}>()

const emit = defineEmits(['update:modelValue', 'select'])

const loading = ref(false)
const items = ref<any[]>([])

const close = () => {
  emit('update:modelValue', false)
}

const selectItem = (item: any) => {
  emit('select', item)
}

const exportToExcel = async () => {
  if (items.value.length === 0) return
  const headers = [
    { title: 'Reference #', key: 'reference_number' },
    { title: 'Master BL', key: 'master_bl' },
    { title: 'Freight line', key: 'freight_line' },
    { title: 'Payment Release', key: 'payment_release' },
    { title: 'Amount', key: 'amount' },
    { title: 'Currency', key: 'currency' },
    { title: 'Created at', key: 'created_at' },
  ]
  const rows = items.value.map((item: any) => ({
    reference_number: item.referencia?.reference_number ?? '',
    master_bl: item.ref_master_bl?.name ?? '',
    freight_line: item.schedule?.line?.name ?? '',
    payment_release: item.schedule?.folio ?? (item.schedule?.id ? `#${item.schedule.id}` : ''),
    amount: item.amount ?? 0,
    currency: getCurrencyName(item.currency_id),
    created_at: formatDateString(item.created_at),
  }))
  try {
    await exportTableToExcel(headers, rows, undefined, 'pending-line-invoice-refs', 'Pending refs')
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error exporting to Excel' })
  }
}

const load = async () => {
  try {
    loading.value = true
    const response: any = await ($api as any).linePayments.getPendingScheduleRefsWithoutInvoice(props.lineId)
    items.value = response || []
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error fetching pending references' })
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (show) => {
    if (show) load()
  }
)
</script>
