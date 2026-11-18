<template>
  <v-container fluid class="tm-dark-adapt">
    <CatalogBackButton fallback-url="/air/import" quick-search="air-import" />
    <LegacyAirImportView :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id!.toString()

definePageMeta({
  title: 'View TM1 Air Import Reference',
  layout: 'default',
})
</script>
