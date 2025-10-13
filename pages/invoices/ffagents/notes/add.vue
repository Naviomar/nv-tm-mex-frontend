<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-2" @click="$router.back()">Back</v-btn>
    <FfAgentInvoiceForm />
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'TM - Add F.F. agent invoice note',
  layout: 'default',
})
</script>
