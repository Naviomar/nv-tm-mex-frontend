<template>
  <v-container fluid>
    <CatalogBackButton fallback-url="/maritime/export" />
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
