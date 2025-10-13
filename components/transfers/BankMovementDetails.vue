<template>
  <div>
    <v-btn @click="router.back()" variant="outlined" size="small" class="mb-4">Back</v-btn>
    <v-card class="py-4">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
        <div class="col-span-1 md:col-span-4 px-4">
          <h1 class="text-xl font-bold">Bank Movement Details</h1>
          <BankMovementReceiptView :bankMovement="bankMovement" />
        </div>
        <div class="col-span-1 md:col-span-8">
          <h2 class="text-xl font-bold">Invoice payments related</h2>
          <v-table density="compact" fixed-header>
            <thead>
              <tr>
                <th class="font-bold!">Invoice #</th>
                <th class="font-bold!">Reference</th>
                <th class="font-bold!">Type</th>
                <th class="font-bold!">Concept</th>
                <th class="font-bold!">Amount</th>
                <th class="font-bold!">Paid</th>
                <th class="font-bold!">Pending</th>
                <th class="font-bold!">Status</th>
                <th class="font-bold!">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(payment, index) in bankMovement.all_payments"
                :key="`inv-${index}`"
                :id="`payment-${payment.id}`"
                :class="{ 'bg-red-100! dark:bg-red-900!': payment.deleted_at }"
              >
                <td>
                  <InvoiceableLabelLink :paymentChargeable="payment.chargeable" />
                </td>
                <td class="whitespace-nowrap">
                  {{ payment.chargeable?.serviceable?.reference_number }}
                </td>
                <td>{{ getInvoiceType(payment) }}</td>
                <td>{{ payment.chargeable?.charge?.name }}</td>
                <td>
                  {{
                    formatToCurrency(
                      parseFloat(payment.chargeable?.amount) + parseFloat(payment.chargeable?.amount_iva || 0)
                    )
                  }}
                </td>
                <td class="whitespace-nowrap">{{ formatToCurrency(payment.amount) }}</td>
                <td class="whitespace-nowrap">{{ formatToCurrency(payment.chargeable?.pending_balance) }}</td>
                <td>
                  <div v-if="!payment.deleted_at">
                    <v-chip
                      :color="payment.chargeable?.pending_balance > 0 ? 'red' : 'green'"
                      text-color="white"
                      small
                      class="capitalize"
                    >
                      {{ payment.chargeable?.pending_balance > 0 ? 'Pending' : 'Paid' }}
                    </v-chip>
                  </div>
                </td>
                <td class="whitespace-nowrap">{{ formatDateString(payment.created_at) }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </div>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()
const route = useRoute()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const bankMovement = ref<any>({})

const getBankMovement = async () => {
  try {
    loadingStore.start()
    const response: any = await $api.bankMovements.getMovement(props.id)

    bankMovement.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getBankMovement()

const getInvoiceType = (payment: any) => {
  if (payment.chargeable_type.includes('ServicePayment')) {
    return 'Payment without invoice'
  }
  return getInvoiceableName(payment.chargeable?.invoice || {})
}

onMounted(() => {
  const focusPayahbleId = route.query.focusPayable
  if (focusPayahbleId) {
    const el = document.getElementById(`payment-${focusPayahbleId}`)
    if (el) {
      // add blink class
      el.classList.add('animate-pulse')
      el.classList.add('bg-blue-100')
      setTimeout(() => {
        el.classList.remove('animate-pulse')
        el.classList.remove('bg-blue-100')
      }, 15000)
    }
  }
})

const viewInvoice = (payment: any) => {
  const invoiceableType = payment.chargeable?.invoice?.invoiceable_type || ''
  if (invoiceableType.includes('InvoiceSeaTm')) {
    router.push(`/invoices/search/tm-view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('InvoiceSeaWm')) {
    router.push(`/invoices/search/wm-view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('FfPayment')) {
    router.push(`/invoices/search/ff-view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('LineInvoiceRef')) {
    // router.push(`/invoices/search/line-view-${payment.chargeable?.invoice?.invoiceable_id}`)
    snackbar.add({ type: 'error', text: 'Invoice route not available' })
    return
  }
  if (invoiceableType.includes('ReqAdvancePayment')) {
    router.push(`/advance-payments/view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('ReqRefund')) {
    router.push(`/refunds/view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }

  // snackbar show error
  snackbar.add({ type: 'error', text: 'Unknown invoice type' })
}
</script>
