<template>
  <v-container fluid>
    <RequestsModuleHeader />
    <LiveChatsPanel ticket-type="process-request" />
    <AuthProcessRequestsTable />
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Auth Process Requests - System',
  layout: 'default',
})
</script>
