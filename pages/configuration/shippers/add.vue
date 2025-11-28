<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/shippers" class="mb-4">Back</v-btn>
    <v-card>
      <v-card-title>
        <h3>New shipper (import) / consignee (export)</h3>
      </v-card-title>
      <v-card-text>
        <ShipperForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Configuration - Shippers / Consignees',
  layout: 'default',
})
</script>
