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
          <h2 class="text-lg mb-2">Agency</h2>
          <v-text-field
            v-model="formData.agency_name"
            label="Representative's name"
            variant="outlined"
            density="compact"
          />
          <v-text-field v-model="formData.agency_phone" label="Agency Phone" variant="outlined" density="compact" />

          <h2 class="text-lg mb-2">Reservation Number (No.Res)</h2>
          <div class="flex items-start gap-2">
            <v-chip color="primary" variant="elevated" class="mt-1 font-mono font-bold text-lg" size="large">
              {{ airlinePrefix }}
            </v-chip>
            <span class="mt-3 text-lg font-bold">-</span>
            <v-autocomplete
              v-model="selectedGuideNumberId"
              :items="availableGuideNumbers"
              item-title="guide_number"
              item-value="id"
              label="Select guide number"
              variant="outlined"
              density="compact"
              :loading="loadingGuideNumbers"
              no-data-text="No available guide numbers for this airline"
              class="flex-grow"
              @update:search="onSearchGuideNumber"
              @update:model-value="onGuideNumberSelected"
              clearable
              @click:clear="onClearGuideNumber"
            >
              <template #item="{ props: itemProps, item }">
                <v-list-item v-bind="itemProps">
                  <template #prepend>
                    <v-icon color="success" size="small">mdi-checkbox-blank-circle</v-icon>
                  </template>
                  <v-list-item-subtitle>
                    {{ airlinePrefix }}-{{ item.raw.guide_number }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-autocomplete>
          </div>
          <div v-if="formData.reservation_number" class="mt-1 mb-2">
            <v-chip color="success" variant="tonal" size="small" prepend-icon="mdi-check-circle">
              No.Res: {{ formData.reservation_number }}
            </v-chip>
          </div>
          <v-alert v-if="guideNumberError" type="error" density="compact" variant="tonal" class="mb-2">
            {{ guideNumberError }}
          </v-alert>
          <h2 class="text-lg mb-2 mt-4">Commodity</h2>
          <v-text-field
            v-model="formData.commodity"
            label="Commodity"
            variant="outlined"
            density="compact"
          />
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

const emit = defineEmits(['refresh-data'])

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

// Inject refresh function from parent
const refreshAllTabs = inject<(() => Promise<void>) | null>('refreshAllTabs', null)

const showModal = ref(false)
const pdfUrl = ref<string | null>(null)
const referenceData = ref<any>(null)

// Guide number state
const availableGuideNumbers = ref<any[]>([])
const selectedGuideNumberId = ref<number | null>(null)
const loadingGuideNumbers = ref(false)
const guideNumberError = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Form data for additional information
const formData = ref({
  reservation_number: '',
  agency_name: '',
  agency_phone: '',
  commodity: '',
})

// Airline prefix computed from reference
const airlinePrefix = computed(() => {
  return props.reference?.airline?.prefix || '---'
})

// Initialize form data when reference data changes
watchEffect(() => {
  if (referenceData.value) {
    formData.value = {
      reservation_number: referenceData.value.reservation_number || '',
      agency_name: referenceData.value.shipper || '',
      agency_phone: referenceData.value.origin_ff?.contact_phone || '',
      commodity: referenceData.value.commodity || '',
    }
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

// Fetch available guide numbers for this airline
const fetchAvailableGuideNumbers = async (search?: string) => {
  if (!props.reference?.airline_id) return
  try {
    loadingGuideNumbers.value = true
    const query: any = { airline_id: props.reference.airline_id }
    if (search) query.search = search

    const response = await $api.airlineGuideNumbers.getAvailable({ query })
    availableGuideNumbers.value = response as any[]
  } catch (e) {
    console.error('Error fetching guide numbers:', e)
  } finally {
    loadingGuideNumbers.value = false
  }
}

const onSearchGuideNumber = (search: string) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchAvailableGuideNumbers(search)
  }, 300)
}

const onGuideNumberSelected = (id: number | null) => {
  guideNumberError.value = ''
  if (!id) {
    formData.value.reservation_number = ''
    return
  }
  const selected = availableGuideNumbers.value.find((g: any) => g.id === id)
  if (selected) {
    formData.value.reservation_number = `${airlinePrefix.value}-${selected.guide_number}`
  }
}

const onClearGuideNumber = () => {
  selectedGuideNumberId.value = null
  formData.value.reservation_number = ''
  guideNumberError.value = ''
}

// Mark guide number as used when printing
const markGuideNumberAsUsed = async () => {
  if (!selectedGuideNumberId.value) return true // no guide number selected, allow manual
  try {
    await $api.airlineGuideNumbers.markAsUsed({
      guide_number_id: selectedGuideNumberId.value,
      air_reference_id: props.id,
    })
    return true
  } catch (e: any) {
    console.error('Error marking guide number as used:', e)
    guideNumberError.value = e?.data?.message || 'This guide number is already in use. Please select another one.'
    // Refresh available list
    await fetchAvailableGuideNumbers()
    return false
  }
}

const openPreviewModal = async () => {
  try {
    loadingStore.start()

    // If a guide number is selected, mark it as used first
    if (selectedGuideNumberId.value) {
      const success = await markGuideNumberAsUsed()
      if (!success) {
        loadingStore.stop()
        return
      }
    }

    // Send form data in the request body
    const fetchOptions = {
      responseType: 'blob' as const,
      body: {
        additional_info: formData.value,
      },
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

const closeModal = async () => {
  if (pdfUrl.value) {
    window.URL.revokeObjectURL(pdfUrl.value)
    pdfUrl.value = null
  }
  showModal.value = false

  console.log('📄 Closing modal and refreshing tabs...')
  // Refresh all tabs data
  if (refreshAllTabs) {
    await refreshAllTabs()
  } else {
    console.warn('⚠️ refreshAllTabs not available')
  }
  emit('refresh-data')
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
    // Load available guide numbers for this airline
    await fetchAvailableGuideNumbers()
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
