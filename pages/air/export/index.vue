<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Export - Air</h1>
    <div class="flex justify-end gap-3">
      <v-btn to="/air/export/add" color="success"> <v-icon>mdi-plus</v-icon> New export reference </v-btn>
    </div>
    <div class="pt-4">
      <AirExportTable />
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Export - Air',
  layout: 'default',
})
</script>
