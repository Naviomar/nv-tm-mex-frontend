<template>
  <div>
    <v-container fluid>
      <div class="d-flex align-center mb-4">
        <v-btn color="slate" size="small" variant="outlined" to="/adminpack">Back to admin pack</v-btn>
        <v-spacer />
        <v-btn
          v-if="isSuperAdminRole()"
          color="indigo"
          size="small"
          variant="tonal"
          prepend-icon="mdi-history"
          @click="historyOpen = true"
        >
          Export history
        </v-btn>
      </div>

      <v-card>
        <v-card-title>
          <h3>Export TM Invoices</h3>
        </v-card-title>
        <v-card-text>
          <InvoiceExportModule />
        </v-card-text>
      </v-card>

      <ExportLogHistoryDialog v-if="isSuperAdminRole()" v-model="historyOpen" />
    </v-container>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Export - TM Invoices',
  layout: 'default',
})

const { isSuperAdminRole } = useCheckUser()
const historyOpen = ref(false)
</script>
