<template>
  <v-container fluid class="tm-dark-adapt">
    <CatalogBackButton fallback-url="/maritime/export" quick-search="sea-export" />
    <MaritimeExportOperationsForm :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = Number(route.params.id)

definePageMeta({
  title: `View Maritime Export Reference`,
  layout: 'default',
})
</script>
