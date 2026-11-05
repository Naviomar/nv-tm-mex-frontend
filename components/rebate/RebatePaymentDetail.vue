<template>
  <div class="rebate-payment">
    <div v-if="loading && !data" class="flex justify-center pa-12"><v-progress-circular indeterminate color="primary" /></div>
    <v-alert v-else-if="error" type="error" variant="tonal">{{ error }}</v-alert>

    <v-card v-else-if="data" :class="status === 'cancelled' ? 'bg-red-200 dark:bg-red-800!' : ''">
      <v-card-title class="tm-btn-group">
        <h3>Rebate - Payment request {{ data.batch.folio || `#${batchId}` }}</h3>
        <v-chip :color="paymentStatus(status).color" :prepend-icon="paymentStatus(status).icon">{{ paymentStatus(status).label }}</v-chip>
        <v-spacer />
        <v-btn variant="tonal" color="primary" prepend-icon="mdi-book-open-page-variant-outline" @click="docs.open('rebate', 'payments')">How it works</v-btn>
        <v-btn variant="tonal" color="success" prepend-icon="mdi-file-excel-outline" :loading="busy === 'download'" @click="download">Excel</v-btn>
      </v-card-title>

      <v-card-text>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <!-- Details -->
          <v-card>
            <v-card-title>Details</v-card-title>
            <v-card-text>
              <div class="grid grid-cols-2 gap-2">
                <div>Folio:</div>
                <div class="font-bold">{{ data.batch.folio || `#${batchId}` }}</div>
                <div>Requested by:</div>
                <div>{{ data.batch.requested_by || '—' }}</div>
                <div>Requested at:</div>
                <div>{{ formatDateString(data.batch.requested_at) }}</div>
                <div>Rebate in this request:</div>
                <div class="font-bold">{{ formatToCurrency(data.total_visible) }} USD</div>
                <template v-if="data.withheld > 0">
                  <div>Withheld (special case):</div>
                  <div class="text-warning font-bold">− {{ formatToCurrency(data.withheld) }} USD</div>
                  <div>Net to pay:</div>
                  <div class="text-success font-bold">{{ formatToCurrency(data.net_visible) }} USD</div>
                </template>
                <template v-if="data.batch.payment_reference">
                  <div>Payment reference:</div>
                  <div class="font-bold">{{ data.batch.payment_reference }}</div>
                </template>
                <template v-if="data.batch.cancel_reason">
                  <div>Cancelled because:</div>
                  <div>{{ data.batch.cancel_reason }}</div>
                </template>
              </div>
              <v-alert v-if="data.partial" type="info" variant="tonal" density="compact" class="mt-3">
                You only see the containers of your executives. The request has {{ data.batch.rows }} containers in total.
              </v-alert>

              <!-- Accounting (rebate-payments-process): mark as paid or cancel. -->
              <div class="tm-btn-group pt-4">
                <template v-if="actionsVisible">
                  <v-btn color="success" size="small" prepend-icon="mdi-cash-check" :loading="busy === 'paid'" @click="dialog = { action: 'paid', open: true }">
                    Mark as paid
                  </v-btn>
                  <v-btn color="red" size="small" prepend-icon="mdi-close-octagon-outline" @click="dialog = { action: 'cancel', open: true }">
                    Cancel request
                  </v-btn>
                </template>
                <span v-else class="text-sm text-medium-emphasis">You can follow the status of this payment here.</span>
              </div>
            </v-card-text>
          </v-card>

          <!-- Progress -->
          <v-card>
            <v-card-title>Progress</v-card-title>
            <v-card-text>
              <v-timeline density="compact" side="end" align="start" truncate-line="both">
                <v-timeline-item
                  v-for="step in steps"
                  :key="step.key"
                  size="small"
                  :dot-color="stepDone(step.key) ? paymentStatus(step.key).color : 'grey-lighten-1'"
                  :icon="stepDone(step.key) ? 'mdi-check' : undefined"
                >
                  <div class="flex justify-between gap-2">
                    <div :class="stepDone(step.key) ? 'font-bold' : 'text-medium-emphasis'">{{ step.title }}</div>
                    <div class="text-sm text-medium-emphasis">{{ data.batch[step.at] ? formatDateString(data.batch[step.at]) : '' }}</div>
                  </div>
                  <div class="text-xs text-medium-emphasis">{{ step.who }}</div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </div>

        <!-- Containers -->
        <v-card class="mb-4">
          <v-card-title>Containers ({{ data.rows.length }})</v-card-title>
          <v-card-text>
            <v-table density="compact" fixed-header :height="data.rows.length > 12 ? '45vh' : undefined">
              <thead>
                <tr>
                  <th class="text-left">Customer</th>
                  <th class="text-left">Executive</th>
                  <th class="text-left">Reference</th>
                  <th class="text-left">
                    ETA
                    <v-icon size="x-small" class="ml-1 text-medium-emphasis">mdi-information-outline</v-icon>
                    <v-tooltip activator="parent" location="top">Reference ETA. If it has none, the ETD is shown (marked ETD); if neither, the date the reference was created (marked Created).</v-tooltip>
                  </th>
                  <th class="text-left">Container</th>
                  <th class="text-right">Rebate</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in data.rows" :key="row.id" class="dark:hover:bg-gray-700 hover:bg-slate-300">
                  <td>{{ row.customer }}</td>
                  <td>{{ row.executive }}</td>
                  <td class="font-medium whitespace-nowrap">
                    {{ row.reference }}
                    <v-chip v-if="row.special_case" size="x-small" label variant="outlined" class="ml-1" :color="row.special_case.pending > 0 ? 'warning' : 'success'" prepend-icon="mdi-folder-check-outline">
                      {{ row.special_case.pending > 0 ? 'Special case' : 'Covered by case' }}
                      <v-tooltip activator="parent" location="top">«{{ row.special_case.case }}»: demurrage {{ formatToCurrency(row.special_case.original) }}, covered {{ formatToCurrency(row.special_case.covered) }}</v-tooltip>
                    </v-chip>
                  </td>
                  <td class="whitespace-nowrap">
                    {{ row.etd }}
                    <v-chip v-if="row.date_source && row.date_source !== 'eta'" size="x-small" variant="tonal" color="warning" class="ml-1">{{ row.date_source === 'etd' ? 'ETD' : 'Created' }}</v-chip>
                  </td>
                  <td class="whitespace-nowrap">{{ row.container }}</td>
                  <td class="text-right whitespace-nowrap">{{ formatToCurrency(row.amount) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <!-- Withheld -->
        <v-card v-if="data.adjustments?.length" class="mb-4">
          <v-card-title>Withheld to cover a customer debt</v-card-title>
          <v-card-text>
            <v-table density="compact">
              <thead><tr><th class="text-left">Case</th><th class="text-left">Customer</th><th class="text-left">Debt reference</th><th class="text-left">Debt</th><th class="text-left">From the rebate of</th><th class="text-right">Withheld</th></tr></thead>
              <tbody>
                <tr v-for="(adjustment, i) in data.adjustments" :key="i">
                  <td>{{ adjustment.case }}</td><td>{{ adjustment.customer }}</td><td class="whitespace-nowrap">{{ adjustment.reference }}</td>
                  <td>{{ adjustment.debt || '—' }}</td><td class="whitespace-nowrap">{{ adjustment.rebate_reference }}</td>
                  <td class="text-right">− {{ formatToCurrency(adjustment.amount) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <!-- History -->
        <v-card>
          <v-card-title>History</v-card-title>
          <v-card-text>
            <v-table density="compact">
              <thead><tr><th class="text-left">Date</th><th class="text-left">Event</th><th class="text-left">User</th><th class="text-left">Note</th></tr></thead>
              <tbody>
                <tr v-for="(event, i) in data.events" :key="i">
                  <td class="whitespace-nowrap">{{ formatDateString(event.at) }}</td>
                  <td class="font-medium">{{ eventLabel(event.event) }}</td>
                  <td>{{ event.user || '—' }}</td>
                  <td>{{ event.note || '' }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog.open" max-width="500">
      <v-card>
        <v-card-title>{{ dialog.action === 'paid' ? 'Mark as paid' : 'Cancel payment request' }}</v-card-title>
        <v-card-text>
          <v-text-field v-if="dialog.action === 'paid'" v-model="reference" label="Payment reference" density="compact" />
          <template v-else>
            <v-alert type="warning" variant="tonal" density="compact" class="mb-4">The containers go back to available and can be requested again.</v-alert>
            <v-textarea v-model="reason" label="Reason" density="compact" :rows="3" />
          </template>
        </v-card-text>
        <v-card-actions class="tm-dialog-actions">
          <v-btn color="red" @click="dialog.open = false">Close</v-btn>
          <v-spacer />
          <v-btn color="primary" :disabled="dialog.action === 'paid' ? !reference.trim() : !reason.trim()" @click="submitDialog">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ batchId: number }>()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { paymentStatus, saveBlob } = useRebate()
const docs = usePageDocs()

const loading = ref(false)
const busy = ref('')
const error = ref('')
const data = ref<any>(null)
const dialog = reactive({ open: false, action: 'paid' as 'paid' | 'cancel' })
const reference = ref('')
const reason = ref('')

const steps = [
  { key: 'requested', title: 'Requested', at: 'requested_at', who: 'Executive' },
  { key: 'paid', title: 'Paid', at: 'paid_at', who: 'Accounting, with the payment reference' },
]
const ORDER = ['requested', 'paid']
const status = computed(() => data.value?.batch.status as string)
const stepDone = (key: string) => status.value !== 'cancelled' && ORDER.indexOf(status.value) >= ORDER.indexOf(key)
const canProcess = computed(() => !!data.value?.can.process)
const actionsVisible = computed(() => canProcess.value && status.value === 'requested')

const eventLabel = (e: string) =>
  ({ requested: 'Payment requested', paid: 'Marked as paid', cancelled: 'Cancelled', case_covered: 'Debt covered in TM1' })[e] ?? e

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = (await $api.rebate.getPayment(props.batchId)).data
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Could not load the request'
  } finally {
    loading.value = false
  }
}

async function run(action: 'paid' | 'cancel', body?: Record<string, any>) {
  busy.value = action
  try {
    await $api.rebate.paymentAction(props.batchId, action, body)
    snackbar.add({ type: 'success', text: 'Done' })
  } catch (e: any) {
    snackbar.add({ type: 'error', text: e?.data?.message ?? 'The action could not be completed' })
  } finally {
    busy.value = ''
    await load()
  }
}

async function submitDialog() {
  const action = dialog.action
  dialog.open = false
  await run(action, action === 'paid' ? { payment_reference: reference.value.trim() } : { reason: reason.value.trim() })
}

async function download() {
  busy.value = 'download'
  try {
    saveBlob(await $api.rebate.downloadPayment(props.batchId), `rebate-payment-${data.value?.batch.folio ?? props.batchId}`)
  } catch {
    snackbar.add({ type: 'error', text: 'Could not download the Excel' })
  } finally {
    busy.value = ''
  }
}

onMounted(load)
</script>
