<template>
  <v-container fluid>
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 class="text-xl font-bold">Export - Maritime</h1>
      <div class="flex justify-end gap-3">
        <v-btn to="/maritime/export/add" color="success"> <v-icon>mdi-plus</v-icon> New export reference </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <MaritimeExportTable />
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Export - Maritime',
  layout: 'default',
})
</script>
