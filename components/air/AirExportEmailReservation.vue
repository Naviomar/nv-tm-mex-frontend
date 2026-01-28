<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex items-center gap-2">
          <v-icon>mdi-email-outline</v-icon>
          <span>Email Reservation</span>
        </div>
      </v-card-title>
      <v-card-subtitle>Send reservation details via email</v-card-subtitle>
      <v-card-text>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <v-text-field
              v-model="emailData.to"
              label="To (Email Address)"
              density="compact"
              variant="outlined"
              type="email"
              hint="Enter recipient email address"
            />
          </div>
          <div>
            <v-text-field
              v-model="emailData.cc"
              label="CC (Optional)"
              density="compact"
              variant="outlined"
              type="email"
              hint="Enter CC email addresses (comma separated)"
            />
          </div>
          <div>
            <v-text-field v-model="emailData.subject" label="Subject" density="compact" variant="outlined" />
          </div>
          <div>
            <v-textarea
              v-model="emailData.body"
              label="Message Body"
              density="compact"
              variant="outlined"
              rows="8"
              hint="Email message content"
            />
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <v-btn color="primary" prepend-icon="mdi-email-send" @click="sendEmail"> Send Email </v-btn>
          <v-btn color="secondary" prepend-icon="mdi-eye" @click="openPreviewModal"> Preview Email </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>Reservation Details Preview</v-card-title>
      <v-card-text>
        <div v-if="reference" class="text-sm">
          <div class="grid grid-cols-2 gap-2 mb-2">
            <div><strong>Reference:</strong> {{ reference.reference_number }}</div>
            <div><strong>Master AWB:</strong> {{ reference.master_awb }}</div>
          </div>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <div><strong>Airline:</strong> {{ reference.airline?.name }}</div>
            <div><strong>Origin:</strong> {{ reference.origin }}</div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div><strong>Destination:</strong> {{ reference.destination }}</div>
            <div><strong>Shipper:</strong> {{ reference.consignee?.name }}</div>
          </div>
        </div>
        <div v-else class="text-center text-grey">Loading reference data...</div>
      </v-card-text>
    </v-card>

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
          <iframe
            v-if="pdfUrl"
            :src="pdfUrl"
            style="width: 100%; height: 100%; border: none"
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

const emailData = ref({
  to: '',
  cc: '',
  subject: `Reservation for ${props.reference?.reference_number || 'Reference'}`,
  body: '',
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

    const response = (await $api.airExport.previewEmailPdf(props.id)) as any

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

const sendEmail = async () => {
  try {
    loadingStore.start()

    const payload = {
      to: emailData.value.to,
      cc: emailData.value.cc,
      subject: emailData.value.subject,
      body: emailData.value.body,
    }

    const response = await $api.airExport.sendEmailPdf(props.id, payload)

    snackbar.add({ type: 'success', text: 'Email sent successfully' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error sending email' })
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

<style scoped>
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
