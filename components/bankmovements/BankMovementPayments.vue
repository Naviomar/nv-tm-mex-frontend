<template>
  <div>
    <div v-if="hasPayments">
      <v-btn color="amber" size="small" @click="showPaymentsDialog">Show payments</v-btn>
    </div>
    <v-dialog v-model="paymentsDialog" max-width="800px">
      <v-card color="amber">
        <v-card-title><v-icon>mdi-cash-fast</v-icon> Payments ({{ getTotalPayments }})</v-card-title>
        <v-card-text>
          <v-table density="compact" class="max-h-[50vh] overflow-x-hidden overflow-y-auto" fixed-header>
            <thead>
              <tr>
                <th>Service / Module</th>
                <th>Concept</th>
                <th>{{ invoiceColumnLabel }}</th>
                <th>Payment ID</th>
                <th>Amount</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody class="">
              <tr
                v-for="payment in allPayments"
                :key="payment.id"
                :class="{ 'bg-red-100! dark:bg-red-900!': payment.deleted_at }"
              >
                <td class="whitespace-nowrap">{{ getPaymentService(payment) }}</td>
                <td>{{ getPaymentChargeableName(payment) }}</td>
                <td class="whitespace-nowrap">
                  <InvoiceableLabelLink :paymentChargeable="payment.chargeable" />
                </td>
                <td>#{{ payment.id }}</td>
                <td>{{ getCurrencyName(payment.currency_id) }} {{ formatToCurrency(payment.amount) }}</td>
                <td class="whitespace-nowrap">
                  <UserInfoBadge :item="payment">
                    {{ formatDateString(payment.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="text-right">Total</td>
                <td>
                  {{ formatToCurrency(totalAmount) }}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="paymentsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { invoiceableName } from '~/utils/data/morphNames'

const props = defineProps({
  bankMovement: {
    type: Object,
    required: true,
  },
})

const paymentsDialog = ref(false)

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

// El listado trae solo payments_count / payments_sum_amount; el detalle de pagos (all_payments)
// se pide al abrir el diálogo. El detalle y la búsqueda ya lo traen incluido.
const loadedPayments = ref<any[] | null>(null)
const allPayments = computed<any[]>(() => props.bankMovement?.all_payments ?? loadedPayments.value ?? [])
const activePayments = computed(() => allPayments.value.filter((payment: any) => !payment.deleted_at))
const hasLoadedDetail = computed(() => !!props.bankMovement?.all_payments || loadedPayments.value !== null)

const hasData = computed(() => !!props.bankMovement)
const getTotalPayments = computed(() => {
  if (hasLoadedDetail.value) return activePayments.value.length
  return props.bankMovement?.payments_count ?? props.bankMovement?.payments?.length ?? 0
})
const hasPayments = computed(() => getTotalPayments.value > 0 || allPayments.value.length > 0)
const totalAmount = computed(() => {
  if (!hasLoadedDetail.value && props.bankMovement?.payments_sum_amount !== undefined) {
    return parseFloat(props.bankMovement.payments_sum_amount ?? 0)
  }
  return activePayments.value.reduce((acc: number, payment: any) => acc + parseFloat(payment.amount), 0)
})
// Withdrawals pay supplier/agent "requests" (which group several invoices), not invoices directly.
const invoiceColumnLabel = computed(() => (props.bankMovement?.type === 'withdrawal' ? 'Invoice / Request' : 'Invoice'))

const getPaymentService = (payment: any) => {
  if (!payment.chargeable) {
    return 'Unknown'
  }

  if (payment.chargeable.serviceable) {
    return payment.chargeable?.serviceable?.reference_number
  }

  return invoiceableName(payment.chargeable.invoice)
}

const showPaymentsDialog = async () => {
  if (!hasLoadedDetail.value) {
    try {
      loadingStore.start()
      const response: any = await $api.bankMovements.getMovement(String(props.bankMovement.id))
      loadedPayments.value = response?.all_payments ?? []
    } catch (error) {
      console.error(error)
      return
    } finally {
      loadingStore.stop()
    }
  }
  paymentsDialog.value = true
}
</script>
