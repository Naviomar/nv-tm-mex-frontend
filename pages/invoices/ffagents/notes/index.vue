<template>
  <v-container fluid>
    <v-btn size="small" variant="outlined" class="mb-4" @click="$router.back">Back</v-btn>
    <v-card>
      <v-card-title>
        <h1 class="text-xl font-bold">F.F. Agent notes (invoices)</h1>
      </v-card-title>
      <v-card-text>
        <div class="py-4">
          <v-btn to="/invoices/ffagents/notes/add" size="small" color="primary"> Create invoice </v-btn>
        </div>
        <FfAgentInvoiceNotesTable />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'TM - F.F. Agent invoices notes',
  layout: 'default',
})
</script>
