<template>
  <v-container fluid>
    <ContainerDelayRatesConfigurator mode="edit" :rateId="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.id)
</script>
