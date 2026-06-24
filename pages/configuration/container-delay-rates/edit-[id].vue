<template>
  <v-container fluid>
    <ContainerDelayRatesLineManager mode="edit" :rateId="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.id)
</script>
