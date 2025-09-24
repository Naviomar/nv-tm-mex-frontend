<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">Back</v-btn>
    <FactraCfdiDetailViewOnly :id="id" />
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Invoices',
  layout: 'default',
})

const route = useRoute()

const id = route.params.id!.toString()
</script>
