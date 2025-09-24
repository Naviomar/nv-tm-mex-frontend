<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">New maritime export</h1>
    <v-btn to="/maritime/export" color="slate" size="small" variant="outlined">
      <v-icon>mdi-arrow-left</v-icon> Back
    </v-btn>
    <v-card>
      <v-card-text>
        <MaritimeExportForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Export - Maritime',
  layout: 'default',
})
</script>
