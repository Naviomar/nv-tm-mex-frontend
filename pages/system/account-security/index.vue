<template>
  <v-container fluid>
    <div class="d-flex align-center mb-4">
      <v-icon color="primary" class="mr-2">mdi-shield-lock-outline</v-icon>
      <h1 class="text-xl font-bold flex-grow-1">Access security</h1>
    </div>
    <AccountSecurityAdmin />
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Access security',
  layout: 'default',
})
</script>
