<template>
  <v-container fluid>
    <ForgotPassword />
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: `Forgot Password`,
  layout: 'guest-empty',
  sanctum: {
    excluded: true,
  },
})
</script>
