<template>
  <v-container fluid class="tm-dark-adapt">
    <CatalogBackButton fallback-url="/maritime/export" quick-search="sea-export" />
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
