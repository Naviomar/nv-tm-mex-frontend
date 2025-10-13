<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">Back</v-btn>

    <v-card>
      <v-card-title>
        <h3>Agent F.F. payment invoice</h3>
      </v-card-title>
      <v-card-text>
        <AgentFFPaymentInvoiceDetail :id="id" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id.toString()

definePageMeta({
  title: 'TM - F.F. payment invoice',
  layout: 'default',
})
</script>
