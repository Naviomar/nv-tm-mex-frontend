<template>
  <div>
    <v-btn
      color="primary"
      density="compact"
      :loading="loadingStore.loading"
      :disabled="loadingStore.loading"
      @click="previewInvoice"
      :size="size"
      >View Customer Credit Note PDF</v-btn
    >
    <v-dialog v-model="proformaDialog.show" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closePreview">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Customer credit note viewer</v-toolbar-title>
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
const router = useRouter()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
  size: {
    type: String,
    default: 'default',
  },
})

const pdfViewer = ref<any>(null)
const proformaDialog = ref<any>({ type: null, show: false })

const closePreview = () => {
  proformaDialog.value.show = false
}

const previewInvoice = async () => {
  proformaDialog.value.show = true
  try {
    loadingStore.start()

    const body = {
      id: props.id.toString(),
    }
    const response = await $api.consigneeCreditNotes.showPdf(body)
    console.log("-->>",response.value)
    // console.log(data.value)
    const blob = new Blob([response as any], { type: 'application/pdf' })
    const pdfUrl = URL.createObjectURL(blob)
    pdfViewer.value.data = pdfUrl

    snackbar.add({ type: 'success', text: 'PDF generated' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
