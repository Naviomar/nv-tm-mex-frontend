<template>
  <div class="container mx-auto my-8 space-y-8">
      <h1 class="text-2xl font-bold">{{ appName }}</h1>
      <GlobalDashboard />
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const appName = config.public.appName

definePageMeta({
  title: 'Home',
  layout: 'default',
})
</script>
