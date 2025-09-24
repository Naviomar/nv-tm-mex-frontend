<template>
  <div>
    <AuthLogin />
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  title: `Login`,
  layout: 'guest-empty',
  sanctum: {
    excluded: true,
  },
})
</script>
