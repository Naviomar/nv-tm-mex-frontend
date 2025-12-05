<template>
  <v-container fluid>
    <CatalogBackButton fallback-url="/configuration/customers" />
    <CustomerDetails :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const id = route.params.id!.toString()
</script>
