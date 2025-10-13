<template>
  <div>
    <div v-if="isInvoiceCharge">
      <v-btn color="green" size="small" variant="outlined" class="cursor-pointer" @click="goToInvoiceableUrl">
        <v-icon>mdi-open-in-new</v-icon> {{ getInvoiceableName(props.paymentChargeable?.invoice) }} #{{
          getInvoiceableGlobalNumberId(props.paymentChargeable?.invoice)
        }}
      </v-btn>
    </div>
    <div v-if="isServicePayment">
      <v-btn color="green" size="small" variant="outlined"> Service Payment #{{ props.paymentChargeable?.id }} </v-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  paymentChargeable: {
    type: Object,
    required: true,
  },
})

const isInvoiceCharge = computed(() => props.paymentChargeable?.class_name?.includes('InvoiceCharge'))
const isServicePayment = computed(() => props.paymentChargeable?.class_name?.includes('ServicePayment'))

const invoice = computed(() => {
  // if chargeable.includes('InvoiceCharge') return paymentChargeable.invoice
  // if chargeable.includes('ServicePayment') return paymentChargeable.chargeable
})

const invoiceableUrl = computed(() => {
  if (!props.paymentChargeable?.invoice) {
    return null
  }

  return getInvoiceableLink(props.paymentChargeable.invoice)
})

const goToInvoiceableUrl = () => {
  if (!invoiceableUrl.value) {
    return
  }
  navigateTo(invoiceableUrl.value, {
    open: {
      target: '_blank',
    },
  })
}
</script>
