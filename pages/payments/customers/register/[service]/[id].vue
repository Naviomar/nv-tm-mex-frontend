<template>
  <v-container fluid>
    <CustomerRegisterPayment :service="service" :serviceId="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const service = route.params.service!.toString()
const id = route.params.id!.toString()
</script>
