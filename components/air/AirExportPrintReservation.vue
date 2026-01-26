<template>
  <div class="p-8">
    <div class="mb-4 flex gap-2">
      <v-btn color="primary" prepend-icon="mdi-printer" @click="openPreviewModal"> Print Reservation </v-btn>
    </div>

    <div class="grid grid-cols-2 gap-4">
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
            <div class="grid grid-cols-2 gap-2 mb-2">
              <div><strong>Destination:</strong> {{ reference.destination }}</div>
              <div><strong>Shipper:</strong> {{ reference.consignee?.name }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Additional Information Form -->
      <v-card class="p-4">
        <v-card-title>Additional Information</v-card-title>
        <v-card-text>
          <div>
            <h2 class="text-lg mb-2">Dimension</h2>
            <div class="grid grid-cols-3 gap-2">
              <v-text-field v-model="formData.height" label="Height" variant="outlined" density="compact"
                type="number" />
              <v-text-field v-model="formData.length" label="Length" variant="outlined" density="compact"
                type="number" />
              <v-text-field v-model="formData.width" label="Width" variant="outlined" density="compact" type="number" />
            </div>
          </div>

          <h2 class="text-lg mb-2">Agency</h2>
          <v-text-field v-model="formData.agency_name" label="Agency Name" variant="outlined" density="compact" />
          <v-text-field v-model="formData.agency_phone" label="Agency Phone" variant="outlined" density="compact" />

          <h2 class="text-lg mb-2">Reservation Number</h2>
          <v-text-field v-model="formData.reservation_number" label="Reservation Number" variant="outlined"
            density="compact" hint="Can contain alphanumeric characters" />

        </v-card-text>
      </v-card>
    </div>

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
        <v-card-text class="pa-0" style="height: calc(100vh - 64px)">
          <iframe v-if="pdfUrl" :src="pdfUrl" style="width: 100%; height: 100%; border: none"
            title="Reservation PDF Preview" />
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
const referenceData = ref<any>(null)

// Form data for additional information
const formData = ref({
  reservation_number: '',
  height: '',
  length: '',
  width: '',
  agency_name: '',
  agency_phone: ''
})

// Initialize form data when reference data changes
watchEffect(() => {
  if (referenceData.value) {
    console.log('Reference data for airline ID:', referenceData.value.airline_id)
    console.log('Full reference data:', referenceData.value)
    
    // Safely extract dimensions with fallbacks
    let height = '', length = '', width = ''
    
    if (referenceData.value.house_awbs?.length > 0) {
      console.log('House AWBs found:', referenceData.value.house_awbs)
      
      if (referenceData.value.house_awbs[0].cbms?.length > 0) {
        console.log('CBMs found:', referenceData.value.house_awbs[0].cbms)
        height = referenceData.value.house_awbs[0].cbms[0].height || ''
        length = referenceData.value.house_awbs[0].cbms[0].length || ''
        width = referenceData.value.house_awbs[0].cbms[0].width || ''
      } else {
        console.log('No CBMs found in first house AWB')
      }
    } else {
      console.log('No house AWBs found')
    }
    
    formData.value = {
      reservation_number: referenceData.value.reservation_number || '',
      height,
      length,
      width,
      agency_name: referenceData.value.consignee?.name || '',
      agency_phone: referenceData.value.origin_ff?.contact_phone || ''
    }
    
    console.log('Form data set to:', formData.value)
  }
})

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

    // Send form data in the request body
    const fetchOptions = {
      responseType: 'blob' as const,
      body: {
        additional_info: formData.value
      }
    }

    const response = (await $api.airExport.previewReservationPdf(props.id, fetchOptions)) as any

    const blob = new Blob([response], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    pdfUrl.value = url
    showModal.value = true

    snackbar.add({ type: 'success', text: 'PDF generated successfully' })
  } catch (e) {
    console.error('Error generating PDF:', e)
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

// Fetch reference data when component mounts
onMounted(() => {
  fetchReferenceData()
})

const fetchReferenceData = async () => {
  try {
    loadingStore.start()
    const response = await $api.airExport.getReferenceById(props.id)
    referenceData.value = response
    console.log(response);
  } catch (error) {
    console.error('Error fetching reference data:', error)
  } finally {
    loadingStore.stop()
  }
}
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
