<template>
  <v-container fluid>
    <div class="mb-4">
      <v-btn color="slate" size="small" variant="tonal" prepend-icon="mdi-arrow-left" to="/system/departments" class="mb-4">
        Back to departments
      </v-btn>
      <div class="d-flex align-center gap-3">
        <v-avatar color="primary" size="48" rounded="lg">
          <v-icon size="26" color="white">mdi-office-building-plus</v-icon>
        </v-avatar>
        <div>
          <div class="text-h5 font-weight-bold">New department</div>
          <div class="text-caption text-grey-darken-1">Create a new department and configure it later</div>
        </div>
      </div>
    </div>
    <DepartmentForm />
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

definePageMeta({
  title: 'Config Departments',
  layout: 'default',
})
</script>
