<template>
  <v-container fluid>
    <div class="d-flex align-center gap-3 mb-6">
      <v-avatar color="secondary" size="44" rounded="lg">
        <v-icon size="24" color="white">mdi-shield-account</v-icon>
      </v-avatar>
      <div>
        <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase tracking-wide">
          System
        </div>
        <h1 class="text-h5 font-weight-bold leading-tight">Roles & Permissions</h1>
      </div>
    </div>
    <RolePermissionsTable />
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Roles and permissions',
  layout: 'default',
})
</script>
