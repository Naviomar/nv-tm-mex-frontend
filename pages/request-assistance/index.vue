<template>
  <v-container fluid>
    <GrantAuthLinks />
    <div class="flex items-center gap-2">
      <v-icon>mdi-handshake-outline</v-icon>
      <h1 class="text-xl font-bold">Request Assistance</h1>
    </div>
    <div class="pt-4">
      <AuthRequestAssitancesTable />
    </div>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Auth Request Assistance - System',
  layout: 'default',
})
</script>
