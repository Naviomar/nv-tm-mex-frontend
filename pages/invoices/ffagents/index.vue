<template>
  <div>
    <v-card>
      <v-card-title>
        <h1 class="text-xl font-bold">Invoices - Freight Forwarder Agent</h1>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-5">
          <v-card>
            <v-card-title>F.F. Agent invoices</v-card-title>
            <v-card-text>View and capture invoices</v-card-text>
            <v-card-actions>
              <v-btn to="/invoices/ffagents/notes" color="primary"> Go to invoices </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'TM - F.F. Agent invoices',
  layout: 'default',
})
</script>
