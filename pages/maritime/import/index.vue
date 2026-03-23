<template>
  <v-container fluid>
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 class="text-xl font-bold">Import - Maritime</h1>
      <div class="flex md:flex-row flex-col justify-end gap-3">
        <v-btn to="/maritime/import/demurrages" color="primary">
          <div class="flex items-center gap-2"><v-icon>mdi-timer-alert-outline</v-icon> Demurrages</div>
        </v-btn>
        <v-btn to="/maritime/import/add" color="success"> <v-icon>mdi-plus</v-icon> New import reference </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <MaritimeImportTable />
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Import - Maritime',
  layout: 'default',
})
</script>
