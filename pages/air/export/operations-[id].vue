<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Air export</h1>
    <v-btn to="/air/export" color="slate" size="small" variant="outlined"> <v-icon>mdi-arrow-left</v-icon> Back </v-btn>
    <AirExportOperationsForm :id="id!" />
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Export - Air',
  layout: 'default',
})

const route = useRoute()

const id = route.params.id?.toString()
</script>
