<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">Back</v-btn>

    <v-row>
      <v-col cols="12" md="12">
        <v-card>
          <v-card-title>
            <h3>Viewing Sea Import Ref (Invoices)</h3>
          </v-card-title>
          <v-card-text>
            <InvoiceSeaImportDetails :id="id" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Invoices Sea Import Ref Search - TM',
  layout: 'default',
})

const route = useRoute()
const id = route.params.id!.toString()
</script>
