<template>
  <v-container fluid class="tm-dark-adapt">
    <CatalogBackButton fallback-url="/maritime/export" quick-search="sea-export" />
    <LegacySeaExportView :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id!.toString()

definePageMeta({
  title: 'View TM1 Maritime Export Reference',
  layout: 'default',
})
</script>
