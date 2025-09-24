<template>
  <v-container fluid>
    <v-btn to="/maritime/import" color="slate" size="small" variant="outlined" class="mb-2">
      <v-icon>mdi-arrow-left</v-icon> Back
    </v-btn>
    <MaritimeImportForm />
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Import - Maritime - New import reference',
  layout: 'default',
})
</script>
