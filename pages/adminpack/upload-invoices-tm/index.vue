<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/adminpack" class="mb-4">Back to admin pack</v-btn>
    <v-row>
      <v-col cols="12" md="12">
        <v-card>
          <v-card-title>
            <h3>Upload TM Invoices</h3>
          </v-card-title>
          <v-card-text>
            <InvoiceUploadTmModule />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Upload - TM Invoices',
  layout: 'default',
})
</script>
