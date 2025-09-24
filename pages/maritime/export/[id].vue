<template>
  <v-container fluid>
    <v-btn to="/maritime/export" color="slate" size="small" variant="outlined" class="mb-2">
      <v-icon>mdi-arrow-left</v-icon> Back
    </v-btn>
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
