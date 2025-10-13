<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" :to="`/invoices/search/wm-view-${id}`" class="mb-4"
      >Back</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>WM Proforma edition</h3>
      </v-card-title>
      <v-card-text>
        <InvoiceWmEditProforma :id="id" :inv-service="'sea'" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id!.toString()

definePageMeta({
  title: 'Import - Maritime',
  layout: 'default',
})
</script>
