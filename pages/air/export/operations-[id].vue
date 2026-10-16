<template>
  <v-container fluid class="tm-dark-adapt">
    <h1 class="text-xl font-bold">Air export</h1>
    <CatalogBackButton fallback-url="/air/export" quick-search="air-export" />
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
