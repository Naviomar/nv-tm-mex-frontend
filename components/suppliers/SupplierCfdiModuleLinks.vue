<template>
  <div class="flex flex-wrap items-center gap-2 bg-neutral-100 dark:bg-neutral-900 mb-4">
    <v-btn color="slate" size="small" variant="outlined" @click="$router.back()">Back</v-btn>

    <div class="font-bold">Supplier CFDI modules ➡️</div>
    <v-btn color="pink" size="small" to="/invoices/suppliers/cfdis">
      <v-icon v-if="isCfdiModule">mdi-circle-double</v-icon>
      CFDI Invoices
    </v-btn>

    <v-btn color="amber" size="small" to="/invoices/suppliers/cfdis/request-payment">
      <v-icon v-if="isReqPaymentModule">mdi-circle-double</v-icon>
      Request payments
    </v-btn>
    <v-btn v-if="false" color="lime" size="small" to="/invoices/suppliers/cfdis/request-payment/new">
      <v-icon v-if="isNewReqModule">mdi-circle-double</v-icon>
      New payment request
    </v-btn>
    <v-btn color="blue" size="small" to="/advance-payments">
      <v-icon v-if="isAdvancePayment">mdi-circle-double</v-icon>
      Advance payments
    </v-btn>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()

const isCfdiModule = computed(() => route.path === '/invoices/suppliers/cfdis')
const isReqPaymentModule = computed(() => route.path === '/invoices/suppliers/cfdis/request-payment')
const isNewReqModule = computed(() => route.path === '/invoices/suppliers/cfdis/request-payment/new')
const isAdvancePayment = computed(() => route.path === '/advance-payments')
</script>
