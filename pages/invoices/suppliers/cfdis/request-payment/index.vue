<template>
  <v-container fluid>
    <SupplierCfdiModuleLinks />
    <v-card>
      <v-card-title class="flex flex-wrap items-center gap-3">
        <h3>Supplier - Request payments</h3>
        <v-spacer />
        <Can :permission="permissions.SupplierReqPaymentsAuditTimeline">
          <v-btn
            color="deep-purple"
            variant="tonal"
            prepend-icon="mdi-timeline-clock-outline"
            @click="showTimeline = true"
          >
            Invoice traceability
          </v-btn>
        </Can>
        <v-btn
          color="cyan"
          variant="flat"
          prepend-icon="mdi-plus"
          to="/invoices/suppliers/cfdis/request-payment/new"
        >
          Request new payment
        </v-btn>
      </v-card-title>
      <v-card-text>
        <SupplierRequestPaymentsTable />
      </v-card-text>
    </v-card>

    <Can :permission="permissions.SupplierReqPaymentsAuditTimeline">
      <SupplierInvoiceRequestTimelineDialog v-model="showTimeline" />
    </Can>
  </v-container>
</template>
<script setup lang="ts">
import { permissions } from '@/utils/data/system'

const showTimeline = ref(false)
</script>
