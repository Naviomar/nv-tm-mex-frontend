<script setup lang="ts">
import { clientes } from '@/utils/data/clientesData'

const currencies = [
  { id: 1, name: 'MXN' },
  { id: 2, name: 'USD' },
  { id: 3, name: 'EUR' },
]
</script>
<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-2">
        <v-text-field type="date" variant="outlined" label="From"></v-text-field>
        <v-text-field type="date" variant="outlined" label="To"></v-text-field>
      </div>
      <div>
        <v-autocomplete
          :items="clientes"
          item-title="name"
          item-value="id"
          prepend-icon="mdi-account"
          label="Customer"
        />
      </div>
      <div>
        <v-autocomplete
          :items="clientes"
          item-title="name"
          item-value="id"
          prepend-icon="mdi-account-group"
          label="Customer group"
        />
      </div>
      <div>
        <v-autocomplete
          :items="currencies"
          item-title="name"
          item-value="id"
          prepend-icon="mdi-currency-usd"
          label="Currency"
        />
      </div>
      <div>
        <v-btn color="primary" text>Download report</v-btn>
      </div>
    </div>
  </div>
</template>
