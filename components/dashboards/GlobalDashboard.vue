<template>
  <div>
    <v-tabs
      v-model="tab"
      next-icon="mdi-arrow-right-bold-box-outline"
      prev-icon="mdi-arrow-left-bold-box-outline"
      align-tabs="center"
      height="60"
      slider-color="#f78166"
      show-arrows
      grow
      class="rounded-lg bg-sky-200 dark:bg-sky-800"
    >
      <v-tab value="sea-tab">
        <div class="flex gap-4"><v-icon>mdi-ferry</v-icon> Maritime</div>
      </v-tab>
      <v-tab value="air-tab">
        <div class="flex gap-4"><v-icon>mdi-airplane</v-icon> Air</div></v-tab
      >
      <v-tab value="billing-tab">
        <div class="flex gap-4"><v-icon>mdi-invoice-list-outline</v-icon> Billing</div></v-tab
      >
      <v-tab v-if="false" value="suppliers-tab">
        <div class="flex gap-4"><v-icon>mdi-account-details-outline</v-icon> Suppliers</div></v-tab
      >
      <v-tab v-if="false" value="freight-line-tab">
        <div class="flex gap-4"><v-icon>mdi-account-details-outline</v-icon> Freight lines</div></v-tab
      >
      <v-tab v-if="false" value="ff-agents-tab">
        <div class="flex gap-4"><v-icon>mdi-account-details-outline</v-icon> F.F. Agents</div></v-tab
      >
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="sea-tab">
        <SeaDashboard />
      </v-tabs-window-item>
      <v-tabs-window-item value="air-tab">
        <AirDashboard />
      </v-tabs-window-item>
      <v-tabs-window-item value="billing-tab">
        <BillingDashboard />
      </v-tabs-window-item>
      <v-tabs-window-item value="suppliers-tab">
        <SuppliersDashboard />
      </v-tabs-window-item>
      <v-tabs-window-item value="freight-line-tab">
        <FreightLineDashboard />
      </v-tabs-window-item>
      <v-tabs-window-item value="ff-agents-tab">
        <FFAgentsDashboard />
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>
<script setup lang="ts">
const tab = ref<any>('sea-tab')
</script>
