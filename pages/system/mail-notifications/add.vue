<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/system/departments" class="mb-4"
      >Back to departments</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New department</h3>
      </v-card-title>
      <v-card-text>
        <DepartmentForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

definePageMeta({
  title: 'Config Departments',
  layout: 'default',
})
</script>
