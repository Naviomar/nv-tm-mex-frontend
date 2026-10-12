<template>
  <v-alert
    v-if="pending"
    type="error"
    variant="tonal"
    border="start"
    prominent
    class="mb-3 pending-consignee-banner"
    icon="mdi-account-alert-outline"
  >
    <div class="text-subtitle-1 font-bold">CUSTOMER NOT REGISTERED — restricted reference</div>
    <div class="text-sm">
      This reference was captured without a customer only so operations can register it.
      Everything that depends on the customer is blocked until it is assigned: customer emails (arrival notice,
      revalidation, alerts, intermodal), sell rates and customer charges, invoicing, release and demurrages. It is also
      left out of profit and customer reports.
      <span v-if="executiveName">Responsible executive: <b>{{ executiveName }}</b>.</span>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  referencia: {
    type: Object as PropType<any>,
    default: null,
  },
})

// Solo se evalúa cuando la referencia ya cargó (tiene id): un objeto vacío no es "sin cliente"
const pending = computed(() => !!props.referencia?.id && !props.referencia.consignee_id)
const executiveName = computed(() => props.referencia?.executive?.name || '')
</script>
