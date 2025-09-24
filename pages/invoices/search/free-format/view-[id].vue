<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" @click="$router.back()" class="mb-4">Back</v-btn>

    <v-row>
      <v-col cols="12" md="12">
        <v-card>
          <v-card-text>
            <FreeFormatInvoiceDetails :id="id" />
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
  title: 'TM - Party invoice details',
  layout: 'default',
})
</script>
