<template>
  <v-container fluid>
    <h1 class="text-xl font-bold underline mb-2">Roles and permissions</h1>
    <RolePermissionsTable />
  </v-container>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()

definePageMeta({
  title: `Roles and permissions`,
  layout: 'default',
})
</script>
