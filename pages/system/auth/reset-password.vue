<template>
  <v-container fluid>
    <ResetPassword />
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Reset Password',
  layout: 'guest-empty',
  sanctum: {
    excluded: true,
  },
})
</script>
