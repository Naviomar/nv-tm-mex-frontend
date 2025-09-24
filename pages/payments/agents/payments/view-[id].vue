<template>
  <v-container fluid>
    <FFAgentModuleLinks />
    <FreightRequestPaymentDetails :id="$route.params.id!.toString()" />
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Home',
  layout: 'default',
})
</script>
