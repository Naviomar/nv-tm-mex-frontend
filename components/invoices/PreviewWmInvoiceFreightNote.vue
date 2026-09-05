<template>
  <div v-if="isSuperAdmin">
    <v-btn
      color="secondary"
      density="compact"
      :loading="loadingStore.loading"
      :disabled="loadingStore.loading"
      @click="previewInvoice"
      :size="size"
      >VIEW PDF TM</v-btn
    >
    <v-dialog v-model="proformaDialog.show" fullscreen>
      <v-card>
        <v-toolbar color="secondary">
          <v-btn icon @click="closePreviewProforma">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Freight Note Viewer</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <object ref="pdfViewer" type="application/pdf" width="100%" height="100%"></object>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { isSuperAdminRole } = useCheckUser()

const isSuperAdmin = computed(() => isSuperAdminRole())

const props = defineProps({
  service: {
    type: String,
    required: true,
    default: 'sea',
  },
  invoice: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: 'default',
  },
})

const pdfViewer = ref<any>(null)
const proformaDialog = ref<any>({ type: null, show: false })

const closePreviewProforma = () => {
  proformaDialog.value.show = false
}

const previewInvoice = async () => {
  proformaDialog.value.show = true
  try {
    loadingStore.start()
    const body = {
      service: props.service,
      invoiceId: props.invoice.id,
    }
    const response = await $api.wmInvoices.showPdfInvoiceFreightNote(body)

    const blob = new Blob([response as any], { type: 'application/pdf' })
    const pdfUrl = URL.createObjectURL(blob)
    pdfViewer.value.data = pdfUrl

    snackbar.add({ type: 'success', text: 'Freight note generated' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
