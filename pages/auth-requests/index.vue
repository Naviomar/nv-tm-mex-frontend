<template>
  <v-container fluid>
    <GrantAuthLinks />
    <div class="flex items-center gap-2">
      <v-icon>mdi-security</v-icon>
      <h1 class="text-xl font-bold">Authorization Requests</h1>
    </div>
    <div class="pt-4">
      <AuthorizationRequestsTable />
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Auth requests - System',
  layout: 'default',
})
</script>
