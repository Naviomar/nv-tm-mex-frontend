<template>
  <v-container fluid>
    <ScheduleBLModuleLinks />
    <div class="">
      <PaymentSchedulesTable />
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Home',
  layout: 'default',
})
</script>
