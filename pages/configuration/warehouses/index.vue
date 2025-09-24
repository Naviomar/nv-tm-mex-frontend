<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Warehouses</div>
        <v-btn color="primary" to="/configuration/warehouses/add"> Add warehouse </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <WarehousesTable />
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Config Warehouses',
  layout: 'default',
})
</script>
