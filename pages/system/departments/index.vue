<template>
  <v-container fluid>
    <div class="mb-4">
      <v-btn color="slate" size="small" variant="tonal" class="mb-4" prepend-icon="mdi-arrow-left" @click="$router.back()">Back</v-btn>

      <div class="flex items-start justify-between w-full gap-4">
        <div class="d-flex align-center gap-3">
          <v-avatar color="primary" size="48" rounded="lg">
            <v-icon size="26" color="white">mdi-office-building</v-icon>
          </v-avatar>
          <div>
            <div class="text-h5 font-weight-bold">Departments</div>
            <div class="text-caption text-grey-darken-1">Manage company departments and their members</div>
          </div>
        </div>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" to="/system/departments/add">Add department</v-btn>
      </div>
    </div>
    <div>
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
