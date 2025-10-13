<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Air import</h1>
    <div class="mb-2">
      <v-btn to="/air/import" color="slate" size="small" variant="outlined">
        <v-icon>mdi-arrow-left</v-icon> Back
      </v-btn>
    </div>
    <AirImportOperationsForm :id="id!" />
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Import - Air',
  layout: 'default',
})

const route = useRoute()

const id = route.params.id!.toString()
</script>
