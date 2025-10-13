<template>
  <div>
    <v-btn color="green" size="small" variant="outlined" @click="goToPaymentableUrl">
      <v-icon>mdi-open-in-new</v-icon> {{ paymentableName(payment) }} #{{ payment.paymentable_id }}
    </v-btn>

    <!-- Conditional block for BankMovement details -->
    <v-card
      v-if="shortType === 'BankMovement' && payment.paymentable"
      class="pa-3"
      variant="text"
    >
      <div class="text-sm">
        <div><strong>Fecha de movimiento:</strong> {{ formatDateOnlyString(payment.paymentable.movement_date) }}</div>
        <div><strong>Referencia:</strong> {{ payment.paymentable.reference }}</div>
      </div>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { paymentableName } from '~/utils/data/morphNames'
const props = defineProps({
  payment: {
    type: Object,
    required: true,
  },
})

const shortType = computed(() => {
  const full = props.payment.paymentable_type || ''
  return full.split('\\').pop() // Devuelve "BankMovement"
})

const paymentableUrl = computed(() => {
  return getPaymentableLink(props.payment)
})

const goToPaymentableUrl = () => {
  if (!paymentableUrl.value) {
    return
  }
  navigateTo(paymentableUrl.value, {
    open: {
      target: '_blank',
    },
  })
}
</script>
