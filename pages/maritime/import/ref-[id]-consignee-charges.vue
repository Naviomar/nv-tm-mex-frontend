<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">
      <v-icon>mdi-arrow-left</v-icon> Back
    </v-btn>
    <v-card>
      <v-card-title> Customer sell charges configuration with invoices </v-card-title>
      <v-card-text>
        <SeaImportConsigneeChargesSmart :id="id" />
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
