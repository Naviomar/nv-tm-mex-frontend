<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/invoices/search/tm" class="mb-4"
      >Back to TM invoices search</v-btn
    >

    <v-row>
      <v-col cols="12" md="12">
        <v-card>
          <v-card-text>
            <InvoiceAirTmDetail :id="id" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id!.toString()

definePageMeta({
  title: 'Invoice Air TM Details',
  layout: 'default',
})
</script>
