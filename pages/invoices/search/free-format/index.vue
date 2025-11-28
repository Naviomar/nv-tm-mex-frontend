<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/invoices/search" class="mb-4"
      >Back to invoices search</v-btn
    >
    <v-row>
      <v-col cols="12" md="12">
        <v-card>
          <v-card-title>
            <h3>Free format Invoices</h3>
          </v-card-title>
          <v-card-text>
            <div class="flex gap-3">
              <v-btn color="green-darken-4" size="small" to="/invoices/capture/free-format" class="mb-4"
                >Capture invoice</v-btn
              >
            </div>

            <FreeFormatInvoicesTable />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Import - Maritime',
  layout: 'default',
})
</script>
