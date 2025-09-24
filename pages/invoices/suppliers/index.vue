<template>
  <v-container fluid>
    <v-btn size="small" variant="outlined" class="mb-4" @click="$router.back">Back</v-btn>

    <v-card>
      <v-card-title>
        <h1 class="text-xl font-bold">Invoices - Suppliers</h1>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-5">
          <v-card>
            <v-card-title>CFDIs (Factra)</v-card-title>
            <v-card-text>View incoming CFDIs via FACTRA</v-card-text>
            <v-card-actions>
              <v-btn to="/invoices/suppliers/cfdis" color="primary"> Go to module </v-btn>
            </v-card-actions>
          </v-card>
          <v-card>
            <v-card-title>View request payments</v-card-title>
            <v-card-text>View history</v-card-text>
            <v-card-actions>
              <v-btn to="/invoices/suppliers/cfdis/request-payment" color="primary"> Go to module </v-btn>
            </v-card-actions>
          </v-card>
          <v-card>
            <v-card-title>Request a new payment</v-card-title>
            <v-card-text>Request payments by supplier</v-card-text>
            <v-card-actions>
              <v-btn to="/invoices/suppliers/cfdis/request-payment/new" color="primary"> Go to module </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Invoices',
  layout: 'default',
})
</script>
