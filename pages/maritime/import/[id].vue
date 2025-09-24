<template>
  <v-container fluid>
    <v-btn to="/maritime/import" color="slate" size="small" variant="outlined" class="mb-4">
      <v-icon>mdi-arrow-left</v-icon> Back
    </v-btn>
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
