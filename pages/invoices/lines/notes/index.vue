<template>
  <v-container fluid>
    <v-btn size="small" variant="outlined" class="mb-4" @click="$router.back">Back</v-btn>

    <v-card>
      <v-card-title>
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold">Freight line notes (line invoices)</h1>
          <v-btn size="small" color="amber" variant="tonal" @click="showPendingRefsDialog = true">
            <v-icon start size="small">mdi-file-clock-outline</v-icon>
            Pending payment requests without invoice
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="py-4">
          <v-btn to="/invoices/lines/notes/add" size="small" color="primary"> Create invoice </v-btn>
        </div>
        <LineInvoiceNotesTable />
      </v-card-text>
    </v-card>

    <PendingLineInvoiceRefsDialog
      v-model="showPendingRefsDialog"
      @select="onSelectPendingRef"
    />
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()
const snackbar = useSnackbar()

const showPendingRefsDialog = ref(false)

const onSelectPendingRef = (item: any) => {
  const masterBlName = item.ref_master_bl?.name
  showPendingRefsDialog.value = false
  if (!masterBlName) {
    snackbar.add({ type: 'warning', text: 'The selected reference has no Master BL' })
    return
  }
  router.push({
    path: '/invoices/lines/notes/add',
    query: { masterBl: masterBlName },
  })
}

definePageMeta({
  title: 'TM - Line invoices notes',
  layout: 'default',
})
</script>
