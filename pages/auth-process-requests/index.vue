<template>
  <v-container fluid>
    <GrantAuthLinks />
    <div class="flex items-center gap-2">
      <v-icon>mdi-shield-key-outline</v-icon>
      <h1 class="text-xl font-bold">Authorization Process Requests</h1>
    </div>
    <div class="pt-4">
      <AuthProcessRequestsTable />
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Auth Process Requests - System',
  layout: 'default',
})
</script>
