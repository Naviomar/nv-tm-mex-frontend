<template>
  <div class="w-full max-w-full px-4 sm:px-6 py-6">
    <GrantAuthLinks />
    <div class="flex items-center gap-2">
      <span class="mdi mdi-security text-2xl text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
      <h1 class="text-xl font-bold">Authorization Requests</h1>
    </div>
    <div class="pt-4">
      <AuthorizationRequestsTable />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Auth requests - System',
  layout: 'default',
})
</script>
