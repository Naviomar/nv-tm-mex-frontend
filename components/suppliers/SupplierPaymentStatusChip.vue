<template>
  <v-tooltip location="top" :text="tooltip" :disabled="!tooltip">
    <template #activator="{ props: tooltipProps }">
      <v-chip v-bind="tooltipProps" size="small" variant="tonal" :color="meta.color" class="font-weight-medium">
        <v-icon start size="14">{{ meta.icon }}</v-icon>
        {{ meta.label }}
      </v-chip>
    </template>
  </v-tooltip>
</template>
<script setup lang="ts">
// Estado de pago estándar de una factura de proveedor (CFDI) a partir de sus conceptos y su(s) solicitud(es).
type SupplierPaymentStatus = 'pending_request' | 'partially_requested' | 'requested' | 'partially_paid' | 'paid'

const props = defineProps<{
  status: SupplierPaymentStatus
  paidAt?: string | null
  requestedAt?: string | null
}>()

const META: Record<SupplierPaymentStatus, { label: string; color: string; icon: string }> = {
  pending_request: { label: 'Pending request', color: 'grey', icon: 'mdi-file-clock-outline' },
  partially_requested: { label: 'Partially requested', color: 'orange', icon: 'mdi-file-arrow-up-down-outline' },
  requested: { label: 'Pending payment', color: 'warning', icon: 'mdi-cash-clock' },
  partially_paid: { label: 'Partially paid', color: 'light-blue', icon: 'mdi-cash-minus' },
  paid: { label: 'Paid', color: 'success', icon: 'mdi-cash-check' },
}

const meta = computed(() => {
  const base = META[props.status] ?? META.pending_request
  return props.status === 'paid' && props.paidAt ? { ...base, label: `Paid @ ${formatDateOnlyString(props.paidAt)}` } : base
})

const tooltip = computed(() => (props.requestedAt ? `Requested at ${formatDateOnlyString(props.requestedAt)}` : ''))
</script>
