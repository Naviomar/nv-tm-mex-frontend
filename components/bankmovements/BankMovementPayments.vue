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
                <th>Invoice</th>
                <th>Payment ID</th>
                <th>Amount</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody class="">
              <tr
                v-for="payment in props.bankMovement.all_payments"
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
                  {{
                    formatToCurrency(
                      props.bankMovement.payments.reduce(
                        (acc: any, payment: any) => acc + parseFloat(payment.amount),
                        0
                      )
                    )
                  }}
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

const hasData = computed(() => !!props.bankMovement)
const hasPayments = computed(() => !!props.bankMovement?.payments)
const getTotalPayments = computed(() => props.bankMovement?.payments?.length || 0)

const getPaymentService = (payment: any) => {
  if (!payment.chargeable) {
    return 'Unknown'
  }

  if (payment.chargeable.serviceable) {
    return payment.chargeable?.serviceable?.reference_number
  }

  return invoiceableName(payment.chargeable.invoice)
}

const showPaymentsDialog = () => {
  paymentsDialog.value = true
}
</script>
