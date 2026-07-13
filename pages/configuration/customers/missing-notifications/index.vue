<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Customers Admin Notifications</h1>
    <div class="mt-4">
      <v-btn color="slate" size="small" variant="outlined" to="/configuration/customers" class="mb-4"
        >Back to customers</v-btn
      >
    </div>
    <div class="pt-4">
      <ConsigneesMissingNotificationsTable />
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Customers Admin Notifications',
  layout: 'default',
})
</script>
