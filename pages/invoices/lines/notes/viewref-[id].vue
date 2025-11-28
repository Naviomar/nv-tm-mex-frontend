<template>
  <div>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">Back</v-btn>
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="12">
          <v-card>
            <v-card-title>
              <h3>Freight invoice Ref detail #{{ id }}</h3>
            </v-card-title>
            <v-card-text>
              <LineInvoiceRefDetail :id="id" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'TM - Line invoice note',
  layout: 'default',
})

const route = useRoute()
const id = route.params.id.toString()
</script>
