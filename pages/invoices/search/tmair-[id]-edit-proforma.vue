<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" :to="`/invoices/search/tm-air-view-${id}`" class="mb-4"
      >Back</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>Air - TM Proforma edition</h3>
      </v-card-title>
      <v-card-text>
        <InvoiceTmEditProforma :id="id" :inv-service="'air'" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id!.toString()

definePageMeta({
  title: 'Edit Air TM Proforma',
  layout: 'default',
})
</script>
