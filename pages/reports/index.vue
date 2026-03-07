<template>
  <v-container fluid class="pa-6 reports-page-container">
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <div>
            <h1 class="text-h5 font-weight-bold text-grey-darken-3 dark:text-grey-lighten-2 mb-2">
              <v-icon size="40" color="primary" class="mr-3">mdi-chart-box-multiple</v-icon>
              Reports & Analytics
            </h1>
            <p class="text-body-1 text-grey-darken-1 dark:text-grey-lighten-1">
              Comprehensive reporting and data visualization tools for business intelligence
            </p>
          </div>
          <v-btn-toggle
            v-model="viewMode"
            mandatory
            rounded="lg"
            color="primary"
            variant="outlined"
            divided
            density="comfortable"
          >
            <v-btn value="charts" size="large">
              <v-icon start>mdi-chart-bar</v-icon>
              Charts
            </v-btn>
            <v-btn value="reports" size="large">
              <v-icon start>mdi-table</v-icon>
              Reports
            </v-btn>
          </v-btn-toggle>
        </div>
      </v-col>
    </v-row>
    
    <ReportTabs :view-mode="viewMode" />
  </v-container>
</template>

<script setup lang="ts">
const viewMode = ref<'charts' | 'reports'>('reports')

definePageMeta({
  title: 'Reports & Analytics',
  layout: 'default',
})
</script>

<style scoped>
.reports-page-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  min-height: 100vh;
}

.theme--dark .reports-page-container,
:deep(.theme--dark) .reports-page-container {
  background: linear-gradient(135deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-background)) 100%);
}

:deep(.v-btn-toggle) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme--dark :deep(.v-btn-toggle) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

:deep(.v-btn-toggle .v-btn--active) {
  background: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}
</style>
