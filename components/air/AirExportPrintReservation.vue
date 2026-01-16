<template>
  <div>
    <div class="mb-4 flex gap-2">
      <v-btn color="primary" prepend-icon="mdi-printer" @click="openPreviewModal">
        Print Reservation
      </v-btn>
    </div>

    <v-card>
      <v-card-title>Reservation Information</v-card-title>
      <v-card-text>
        <div v-if="reference" class="text-sm">
          <div class="grid grid-cols-2 gap-2 mb-2">
            <div><strong>Reference:</strong> {{ reference.reference_number }}</div>
            <div><strong>Airline:</strong> {{ airlineName }}</div>
          </div>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <div><strong>Master AWB:</strong> {{ reference.master_awb }}</div>
            <div><strong>Origin:</strong> {{ reference.origin }}</div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div><strong>Destination:</strong> {{ reference.destination }}</div>
            <div><strong>Shipper:</strong> {{ reference.consignee?.name }}</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- PDF Preview Modal -->
    <v-dialog v-model="showModal" fullscreen>
      <v-card>
        <v-toolbar color="primary" dark>
          <v-toolbar-title>Reservation Document - {{ airlineName }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="downloadPdf" title="Download PDF">
            <v-icon>mdi-download</v-icon>
          </v-btn>
          <v-btn icon @click="printFromModal" title="Print PDF">
            <v-icon>mdi-printer</v-icon>
          </v-btn>
          <v-btn icon @click="closeModal" title="Close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-0" style="height: calc(100vh - 64px);">
          <iframe
            v-if="pdfUrl"
            :src="pdfUrl"
            style="width: 100%; height: 100%; border: none;"
            title="Reservation PDF Preview"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  reference: {
    type: Object,
    default: null,
  },
})

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const showModal = ref(false)
const pdfUrl = ref<string | null>(null)

// Computed properties for airline detection
const isChinaCargo = computed(() => props.reference?.airline_id === 27)
const isEvaAir = computed(() => props.reference?.airline_id === 30)

const airlineName = computed(() => {
  if (isChinaCargo.value) return 'China Cargo Airlines'
  if (isEvaAir.value) return 'EVA Air'
  return props.reference?.airline?.name || 'Unknown Airline'
})

const openPreviewModal = async () => {
  try {
    loadingStore.start()
    
    const response = await $api.airExport.previewReservationPdf(props.id) as any
    
    const blob = new Blob([response], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    
    pdfUrl.value = url
    showModal.value = true
    
    snackbar.add({ type: 'success', text: 'PDF generated successfully' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error generating PDF' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const closeModal = () => {
  if (pdfUrl.value) {
    window.URL.revokeObjectURL(pdfUrl.value)
    pdfUrl.value = null
  }
  showModal.value = false
}

const printFromModal = () => {
  if (pdfUrl.value) {
    const printWindow = window.open(pdfUrl.value)
    if (printWindow) {
      printWindow.print()
    }
  }
}

const downloadPdf = () => {
  if (pdfUrl.value) {
    const link = document.createElement('a')
    link.href = pdfUrl.value
    link.download = `reservation-${props.reference?.reference_number || props.id}.pdf`
    link.click()
  }
}

onUnmounted(() => {
  if (pdfUrl.value) {
    window.URL.revokeObjectURL(pdfUrl.value)
  }
})
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #reservation-document,
  #reservation-document * {
    visibility: visible;
  }
  #reservation-document {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
