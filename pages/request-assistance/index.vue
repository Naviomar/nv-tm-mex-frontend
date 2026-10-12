<template>
  <v-container fluid>
    <RequestsModuleHeader />
    <LiveChatsPanel ticket-type="support-assistance" />
    <AuthRequestAssitancesTable />
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Auth Request Assistance - System',
  layout: 'default',
})
</script>
