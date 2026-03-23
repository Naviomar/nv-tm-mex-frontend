<template>
  <v-container fluid>
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 class="text-xl font-bold">Import - Air</h1>
      <div class="flex justify-end gap-3">
        <v-btn to="/air/import/add" color="success"> <v-icon>mdi-plus</v-icon> New import reference </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <AirImportTable />
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Import - Air',
  layout: 'default',
})
</script>
