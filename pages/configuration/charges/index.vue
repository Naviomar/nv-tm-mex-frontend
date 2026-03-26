<template>
  <v-container fluid class="charges-page pa-6">
    <!-- Header Section -->
    <div class="page-header mb-6">
      <div class="d-flex align-center justify-space-between flex-wrap ga-4">
        <div class="d-flex align-center ga-3">
          <v-icon size="32" color="primary">mdi-cash-multiple</v-icon>
          <div>
            <h1 class="text-h5 font-weight-bold text-grey-darken-3 mb-0">
              Charges Catalog
            </h1>
            <p class="text-body-2 text-grey-darken-1 mb-0 mt-1">
              Manage system charges, service assignments, and CFDI configurations
            </p>
          </div>
        </div>
        <div class="d-flex ga-2">
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                color="success"
                variant="tonal"
                :loading="exporting"
                prepend-icon="mdi-file-export"
              >
                Export
                <v-icon end size="small">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list density="compact" class="export-menu">
              <v-list-item @click="handleExportExcel" class="export-item">
                <template v-slot:prepend>
                  <v-icon color="green-darken-2" size="small">mdi-file-excel</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Export to Excel</v-list-item-title>
              </v-list-item>
              <!-- <v-list-item @click="handleExportPdf" class="export-item">
                <template v-slot:prepend>
                  <v-icon color="red-darken-2" size="small">mdi-file-pdf-box</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Export to PDF</v-list-item-title>
              </v-list-item> -->
            </v-list>
          </v-menu>
          <v-btn
            color="primary"
            to="/configuration/charges/add"
            prepend-icon="mdi-plus"
          >
            Add Charge
          </v-btn>
        </div>
      </div>
      <v-divider class="mt-4" />
    </div>

    <!-- Main Content -->
    <ChargesTable />
  </v-container>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const exporting = ref(false)

const handleExportExcel = async () => {
  try {
    exporting.value = true
    const response = await $api.charges.exportExcel()
    
    const url = window.URL.createObjectURL(response as unknown as Blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `charges_export_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting to Excel:', error)
  } finally {
    exporting.value = false
  }
}

const handleExportPdf = async () => {
  try {
    exporting.value = true
    const response = await $api.charges.exportPdf()
    
    const url = window.URL.createObjectURL(response as unknown as Blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `charges_export_${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting to PDF:', error)
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.charges-page {
  min-height: 100vh;
}

.page-header {
  padding: 0;
}

.export-menu {
  min-width: 200px;
}

.export-item {
  padding: 8px 12px;
  transition: background-color 0.2s ease;
}

.export-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Dark mode styles */
.v-theme--dark .export-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .text-grey-darken-3 {
  color: #e0e0e0 !important;
}

.v-theme--dark .text-grey-darken-1 {
  color: #bdbdbd !important;
}

.v-theme--dark .text-grey {
  color: #9e9e9e !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pa-6 {
    padding: 1rem !important;
  }
  
  .d-flex.gap-3 {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .d-flex.gap-2 {
    flex-direction: column;
    width: 100%;
  }
  
  .v-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .text-h5 {
    font-size: 1.25rem !important;
  }
  
  .text-body-2 {
    font-size: 0.875rem !important;
  }
}
</style>
