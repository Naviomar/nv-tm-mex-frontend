<template>
  <div>
    <v-btn
      color="secondary"
      density="compact"
      :loading="loadingStore.loading"
      :disabled="loadingStore.loading"
      block
      @click="previewInvoice"
      :size="size"
      ><v-icon>mdi-file-pdf-box</v-icon> View PDF</v-btn
    >
    <v-dialog v-model="dialog.show" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closePreviewProforma">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Demurrage Cut Viewer</v-toolbar-title>
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
  referencia: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: 'default',
  },
})

const pdfViewer = ref<any>(null)
const dialog = ref<any>({ type: null, show: false })

const closePreviewProforma = () => {
  dialog.value.show = false
}

const previewInvoice = async () => {
  dialog.value.show = true
  try {
    loadingStore.start()

    const response = await $api.demurrages.showPdfCut(props.referencia.id)

    // console.log(data.value)
    const blob = new Blob([response as any], { type: 'application/pdf' })
    const pdfUrl = URL.createObjectURL(blob)
    pdfViewer.value.data = pdfUrl

    snackbar.add({ type: 'success', text: 'Demurrage cut generated' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
