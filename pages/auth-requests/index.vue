<template>
  <v-container fluid>
    <RequestsModuleHeader />
    <LiveChatsPanel ticket-type="authorization-request" />
    <AuthorizationRequestsTable />
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Auth requests - System',
  layout: 'default',
})
</script>
