<template>
  <div>
    <div class="flex">
      <v-tabs v-model="tab" class="rounded-lg bg-sky-200 dark:bg-sky-800" direction="vertical">
        <v-tab value="sea-tab">
          <div class="flex gap-4"><v-icon>mdi-finance</v-icon> Cobranza</div>
        </v-tab>
        <v-tab value="air-tab">
          <div class="flex gap-4"><v-icon>mdi-chart-bar</v-icon> Invoices</div></v-tab
        >
        <v-tab value="billing-tab">
          <div class="flex gap-4"><v-icon>mdi-cash</v-icon> Payments history</div></v-tab
        >
        <v-tab value="suppliers-tab">
          <div class="flex gap-4"><v-icon>mdi-transfer</v-icon> Movement payments</div></v-tab
        >
        <v-tab value="freight-line-tab">
          <div class="flex gap-4"><v-icon>mdi-receipt-clock-outline</v-icon> Charges (pending invoice)</div></v-tab
        >
      </v-tabs>
      <v-tabs-window v-model="tab" class="w-full">
        <v-tabs-window-item value="sea-tab">
          <CobranzaReport />
        </v-tabs-window-item>
        <v-tabs-window-item value="air-tab">
          <CustomerInvoicesReport />
        </v-tabs-window-item>
        <v-tabs-window-item value="billing-tab">
          <PaymentsHistoryReport />
        </v-tabs-window-item>
        <v-tabs-window-item value="suppliers-tab">
          <MovementPaymentsReport />
        </v-tabs-window-item>
        <v-tabs-window-item value="freight-line-tab">
          <ChargesPendingInvoiceReport />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </div>
</template>
<script setup lang="ts">
const tab = ref<any>('sea-tab')
</script>
