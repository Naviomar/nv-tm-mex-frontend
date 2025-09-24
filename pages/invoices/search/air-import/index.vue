<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/invoices/search" class="mb-4"
      >Back to invoices search</v-btn
    >
    <v-row>
      <v-col cols="12" md="12">
        <v-card>
          <v-card-title>
            <h3>Search Air Import references</h3>
          </v-card-title>
          <v-card-text>
            <InvoiceAirImportTable />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Invoices Air Import Ref Search - TM',
  layout: 'default',
})

const router = useRouter()
</script>
