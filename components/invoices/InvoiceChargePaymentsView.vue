<template>
  <div>
    <div v-if="hasPayments">
      <v-btn color="amber" :size="size" @click="showPaymentsDialog">Show payments</v-btn>
    </div>
    <v-dialog v-model="paymentsDialog" max-width="800px">
      <v-card color="amber">
        <v-card-title><v-icon>mdi-cash-fast</v-icon> Payments ({{ getTotalPayments }})</v-card-title>
        <v-card-text>
          <v-table density="compact" class="max-h-[50vh] overflow-x-hidden overflow-y-auto" fixed-header>
            <thead>
              <tr>
                <th>Payment type</th>
                <th>Payment ID</th>
                <th>Amount</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="payment in allPayments"
                :key="payment.id"
                :class="{ 'bg-red-100! dark:bg-red-900!': payment.deleted_at }"
              >
                <td class="whitespace-nowrap">
                  <PaymentableLabelLink :payment="payment" />
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
                <td colspan="2" class="text-right">Total</td>
                <td>
                  {{
                    formatToCurrency(
                      allPayments.reduce((acc: number, payment: any) => acc + parseFloat(payment.amount), 0)
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
const props = defineProps({
  invoice: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: 'small',
    required: false,
  },
})

const paymentsDialog = ref(false)

// ✅ Extract all payments from all charges
const allPayments = computed(() => (props.invoice?.charges ?? []).flatMap((charge: any) => charge.payments ?? []))

// ✅ Check if any payment exists
const hasPayments = computed(() => allPayments.value.length > 0)

// ✅ Get total number of payments
const getTotalPayments = computed(() => allPayments.value.length)

const showPaymentsDialog = () => {
  paymentsDialog.value = true
}
</script>
