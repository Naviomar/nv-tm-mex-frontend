<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Air import</h1>
    <CatalogBackButton fallback-url="/air/import" />
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
