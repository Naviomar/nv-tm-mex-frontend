<template>
  <div>
    <v-container fluid>
      <v-btn color="slate" size="small" variant="outlined" to="/adminpack" class="mb-4">Back to admin pack</v-btn>

      <v-card>
        <v-card-title>
          <h3>Export TM Invoices</h3>
        </v-card-title>
        <v-card-text>
          <InvoiceExportModule />
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Export - TM Invoices',
  layout: 'default',
})
</script>
