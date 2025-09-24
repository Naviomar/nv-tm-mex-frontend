<template>
  <v-container fluid>
    <div>
      <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">Back</v-btn>

      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Departments</div>
        <v-btn color="primary" to="/system/departments/add"> Add department </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <DepartmentsTable />
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: `Departments Administration`,
  layout: 'default',
})
</script>
