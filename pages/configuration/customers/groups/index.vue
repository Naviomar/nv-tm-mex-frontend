<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Customer groups</h1>
    <div class="mt-4">
      <v-btn color="slate" size="small" variant="outlined" to="/configuration/customers" class="mb-4"
        >Back to customers</v-btn
      >
    </div>
    <div class="flex justify-end gap-3">
      <v-btn to="/configuration/customers/groups/add" color="success"><v-icon>mdi-plus</v-icon> Add new group </v-btn>
    </div>
    <div class="pt-4">
      <ConsigneeGroupsTable />
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Customer groups',
  layout: 'default',
})
</script>
