<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">New air export</h1>
    <v-btn to="/air/export" color="slate" size="small" variant="outlined"> <v-icon>mdi-arrow-left</v-icon> Back </v-btn>
    <v-card>
      <v-card-text>
        <AirExportForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Export - Air',
  layout: 'default',
})
</script>
