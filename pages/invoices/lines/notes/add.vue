<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">Back</v-btn>
    <LineInvoiceForm />
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'TM - Add line invoice note',
  layout: 'default',
})
</script>
