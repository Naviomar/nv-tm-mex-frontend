<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Freight lines</h1>
    <div>
      <div class="flex justify-end gap-3">
        <v-btn to="/configuration/lines/add" color="success"><v-icon>mdi-plus</v-icon> Add new freight line </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <LinesTable />
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Lines',
  layout: 'default',
})
</script>
