<template>
  <v-container fluid>
    <CatalogBackButton fallback-url="/maritime/export" />
    <v-card>
      <v-card-text>
        <SeaExportViewDetails :id="id" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id!.toString()

definePageMeta({
  title: `View Maritime Reference #`,
  layout: 'default',
})
</script>
