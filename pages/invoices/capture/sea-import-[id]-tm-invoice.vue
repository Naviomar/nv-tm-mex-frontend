<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="12">
          <v-btn color="slate" size="small" variant="outlined" @click="$router.back()" class="mb-2">Back</v-btn>

          <v-card color="blue-grey-lighten-4">
            <v-card-title>
              <h3 class="font-bold">Capture TM Invoice for Sea Import Reference</h3>
            </v-card-title>
            <v-card-text>
              <CaptureTmInvoiceSeaImport :reference_id="id" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id.toString()

definePageMeta({
  title: 'Import - Maritime',
  layout: 'default',
})
</script>
