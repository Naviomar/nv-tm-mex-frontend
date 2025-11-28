<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" @click="$router.back()" class="mb-4">Back</v-btn>
    <v-row>
      <v-col cols="12" md="12">
        <v-card>
          <v-card-title>
            <h3>Maritime - Demurrages & Detentions</h3>
          </v-card-title>
          <v-card-text>
            <div class="flex gap-3">
              <v-btn color="green-darken-4" size="small" to="/invoices/capture/lines/demurrages" class="mb-4"
                >Request demurrages payment</v-btn
              >
              <v-btn color="green-darken-4" size="small" to="/invoices/capture/lines/detentions" class="mb-4"
                >Request detentions payment</v-btn
              >
              <v-btn color="primary" size="small" to="/invoices/suppliers/cfdis/create">
                <v-icon>mdi-plus</v-icon> Add new supplier CFDI</v-btn
              >
            </div>

            <RequestDemurragesDetentionsTabs />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'TM - Demurrages and detentions requets',
  layout: 'default',
})
</script>
