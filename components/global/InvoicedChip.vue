<template>
  <NuxtLink v-if="invoice" :to="getRoute(invoice)" target="_blank" class="text-decoration-none">
    <v-chip size="small" color="success" variant="tonal" class="ml-2">
      <v-icon start size="small">mdi-check-circle</v-icon>
      {{ invoice.invoice_number || 'Invoiced' }}
    </v-chip>
  </NuxtLink>
  <v-chip v-else size="small" color="error" variant="tonal" class="ml-2">Pending</v-chip>
</template>
<script setup lang="ts">
const props = defineProps({
  charge: {
    type: Object,
    required: true,
  },
  getRoute: {
    type: Function,
    required: true,
  },
})

const invoice = computed(() => {
  return props.charge?.invoice_charge?.invoice || props.charge?.absorbed_invoice || null
})
</script>
