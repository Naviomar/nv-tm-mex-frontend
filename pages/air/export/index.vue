<template>
  <v-container fluid>
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 class="text-xl font-bold">Export - Air</h1>
      <div class="flex justify-end gap-3">
        <v-btn to="/air/export/add" color="success"> <v-icon>mdi-plus</v-icon> New export reference </v-btn>
      </div>
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
