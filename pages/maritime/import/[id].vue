<template>
  <v-container fluid class="tm-dark-adapt">
    <CatalogBackButton fallback-url="/maritime/import" quick-search="sea-import" />
    <MaritimeImportOperationsForm :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = Number(route.params.id)

definePageMeta({
  title: `Sea Import Reference`,
  layout: 'default',
})
</script>
