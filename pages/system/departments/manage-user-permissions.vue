<template>
  <v-container fluid>
    <div class="mb-4">
      <v-btn color="slate" size="small" variant="tonal" prepend-icon="mdi-arrow-left" to="/system/departments" class="mb-4">
        Back to departments
      </v-btn>
      <div class="d-flex align-center gap-3">
        <v-avatar color="primary" size="48" rounded="lg">
          <v-icon size="26" color="white">mdi-account-key</v-icon>
        </v-avatar>
        <div>
          <div class="text-h5 font-weight-bold">Manage User Permissions</div>
          <div class="text-caption text-grey-darken-1">Department coordinator permissions</div>
        </div>
      </div>
    </div>
    <v-alert type="info" variant="tonal" density="compact" class="mb-4 rounded-lg">
      Manage permissions for member users in departments where you are coordinator. You can only modify permissions
      assigned to the department, and only for members (not coordinators). Changes apply immediately.
    </v-alert>
    <DepartmentUserPermissionsForm />
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

definePageMeta({
  title: 'Config Departments',
  layout: 'default',
})
</script>
