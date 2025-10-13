<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">New air import</h1>
    <v-btn to="/air/import" color="slate" size="small" variant="outlined" class="mb-2"> <v-icon>mdi-arrow-left</v-icon> Back </v-btn>
    <v-card>
      <v-card-text>
        <AirImportForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Import - Air',
  layout: 'default',
})
</script>
