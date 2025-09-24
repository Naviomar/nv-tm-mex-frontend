<template>
  <v-container fluid>
    <ScheduleBLModuleLinks />
    <ScheduleLinePaymentsByBL impoExpo="I" />
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Home',
  layout: 'default',
})
</script>
