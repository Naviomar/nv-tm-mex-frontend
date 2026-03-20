<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Charges</div>
        <div class="flex gap-2">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                color="success"
                variant="tonal"
                v-bind="props"
                :loading="exporting"
                prepend-icon="mdi-file-export"
              >
                Export Report
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="handleExportExcel">
                <template v-slot:prepend>
                  <v-icon color="green">mdi-file-excel</v-icon>
                </template>
                <v-list-item-title>Export to Excel</v-list-item-title>
              </v-list-item>
              <v-list-item @click="handleExportPdf">
                <template v-slot:prepend>
                  <v-icon color="red">mdi-file-pdf-box</v-icon>
                </template>
                <v-list-item-title>Export to PDF</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn color="primary" to="/configuration/charges/add"> Add charge </v-btn>
        </div>
      </div>
    </div>
    <div class="pt-4">
      <ChargesTable />
    </div>
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
