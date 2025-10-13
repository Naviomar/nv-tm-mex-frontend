<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/adminpack" class="mb-4">Back to admin pack</v-btn>

    <v-card>
      <v-card-title>
        <h3>AdminPack ZIP files history</h3>
      </v-card-title>
      <v-card-text>
        <InvoiceTmZipJobs />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Upload - TM Invoices',
  layout: 'default',
})
</script>
