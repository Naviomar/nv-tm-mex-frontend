<template>
  <v-container fluid class="tm-dark-adapt">
    <CatalogBackButton fallback-url="/air/export" quick-search="air-export" />
    <LegacyAirExportView :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id!.toString()

definePageMeta({
  title: 'View TM1 Air Export Reference',
  layout: 'default',
})
</script>
