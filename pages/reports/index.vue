<template>
  <v-container fluid class="pa-6 reports-page-container">
    <div class="d-flex align-center mb-6">
      <v-icon size="40" color="primary" class="mr-3">mdi-chart-box-multiple</v-icon>
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Reports & Analytics</h1>
        <p class="text-body-2 mb-0 text-grey-darken-1">
          Business intelligence and data visualization, organized by department
        </p>
      </div>
    </div>

    <ReportsShell />
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Reports & Analytics',
  layout: 'default',
})
</script>

<style scoped>
.reports-page-container {
  background: rgb(var(--v-theme-surface));
  min-height: 100vh;
}

.theme--dark .reports-page-container,
:deep(.theme--dark) .reports-page-container {
  background: rgb(var(--v-theme-surface));
}
</style>
