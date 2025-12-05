<template>
  <v-container fluid>
    <CatalogBackButton fallback-url="/configuration/customers" />
    <v-card>
      <v-card-title>
        <h3>Customer #{{ id }}</h3>
      </v-card-title>
      <v-card-text>
        <ConsigneeEditForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id
</script>
