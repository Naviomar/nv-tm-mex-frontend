<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">Back</v-btn>
    <v-card>
      <v-card-text>
        <LineInvoiceDetail :id="id" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'TM - Line invoice note',
  layout: 'default',
})

const route = useRoute()
const id = route.params.id!.toString()
</script>
