<template>
  <v-container fluid>
    <div class="mb-4">
      <v-btn color="slate" size="small" variant="outlined" @click="$router.back()" class="mb-2">Back</v-btn>

      <CaptureAirReferenceCustomerInvoice :id="id" />
    </div>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

definePageMeta({
  title: 'Invoice Air Reference - TM',
  layout: 'default',
})

const id = route.params.id!.toString()
</script>
