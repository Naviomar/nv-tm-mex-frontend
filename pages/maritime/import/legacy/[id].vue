<template>
  <v-container fluid class="tm-dark-adapt">
    <CatalogBackButton fallback-url="/maritime/import" quick-search="sea-import" />
    <LegacySeaImportView :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id!.toString()

definePageMeta({
  title: 'View TM1 Maritime Reference',
  layout: 'default',
})
</script>
