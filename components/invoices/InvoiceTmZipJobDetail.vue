<template>
  <div class="">
    <div class="font-bold">Job Details</div>
    <v-card v-if="invoiceTmUploadJob" class="elevation-3">
      <v-card-title>
        <h3 class="text-lg font-semibold">Job #{{ invoiceTmUploadJob.id }} - {{ invoiceTmUploadJob.name }}</h3>
      </v-card-title>

      <v-card-text>
        <div class="mb-4">
          <p>
            <strong>Status:</strong>
            <span class="px-2 py-1 rounded" :class="statusClass">
              {{ statusText }}
            </span>
          </p>

          <p v-if="invoiceTmUploadJob.processed_data?.error" class="text-red-600 font-semibold">
            ❌ Error: {{ invoiceTmUploadJob.processed_data?.error }}
          </p>
        </div>

        <!-- If the job is pending (completed=0 & processed_data=null), show a message -->
        <div
          v-if="invoiceTmUploadJob.completed === 0 && invoiceTmUploadJob.processed_data === null"
          class="text-gray-500"
        >
          ⏳ This job is pending execution...
        </div>

        <!-- ✅ Show processed files when available -->
        <div v-else>
          <h4 class="text-md font-semibold mb-2">Processed Files</h4>
          <v-list v-if="processedFilesArray.length">
            <v-list-item v-for="(file, index) in processedFilesArray" :key="index" class="mb-2">
              <p><strong>UUID:</strong> {{ file.uuid }}</p>
              <p><strong>Linked:</strong> {{ file.linked ? '✅ Yes' : '❌ No' }}</p>
              <p v-if="file.model" class="flex gap-2 items-center">
                <strong>Model:</strong> {{ file.model }}
                <span v-if="file.linked">
                  <ViewButton :item="file" @click="viewInvoiceByUuid(file)" />
                </span>
              </p>
              <p v-if="file.id"><strong>Invoice ID:</strong> {{ file.id }}</p>
              <p v-if="file.error" class="text-red-500"><strong>Error:</strong> {{ file.error }}</p>
            </v-list-item>
          </v-list>
          <p v-else class="text-gray-500">No processed files available.</p>
        </div>
      </v-card-text>
    </v-card>

    <v-alert v-else type="warning" class="mt-4"> No job data found. </v-alert>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const invoiceTmUploadJob = ref<any>(null)

const hasProcessedFiles = computed(() => {
  return invoiceTmUploadJob.value?.processed_data
})

// Computed property for job status
const statusText = computed(() => {
  if (invoiceTmUploadJob.value?.completed === 0) {
    return 'Pending'
  }
  return invoiceTmUploadJob.value?.processed_data?.status || 'Unknown'
})

// Computed property for status styling
const statusClass = computed(() => {
  if (invoiceTmUploadJob.value?.completed === 0) {
    return 'bg-yellow-100 text-yellow-700'
  }
  return invoiceTmUploadJob.value?.processed_data?.status === 'success'
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700'
})

const viewInvoiceByUuid = async (file: any) => {
  try {
    loadingStore.start()
    const response = (await $api.invoices.getInvoiceTmByUuid(file.uuid)) as any
    const invoiceUrl = getInvoiceUrl(response)
    if (!invoiceUrl) {
      snackbar.add({ type: 'warning', text: 'Invoice URL not found' })
      return
    }
    navigateTo(invoiceUrl, {
      open: {
        target: '_blank',
      },
    })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getInvoiceUrl = (invoice: any) => {
  const invoiceableType = invoice.invoiceable_type
  if (invoiceableType.includes('InvoiceSeaTm')) {
    return `/invoices/search/tm-view-${invoice.invoiceable_id}`
  }
  if (invoiceableType.includes('InvoiceSeaWm')) {
    return `/invoices/search/wm-view-${invoice.invoiceable_id}`
  }
  if (invoiceableType.includes('InvoiceAirTm')) {
    return `/invoices/search/tm-air-view-${invoice.invoiceable_id}`
  }
  if (invoiceableType.includes('InvoiceAirWm')) {
    return `/invoices/search/wm-air-view-${invoice.invoiceable_id}`
  }
  if (invoiceableType.includes('PartyInvoice')) {
    return `/invoices/search/free-format/view-${invoice.invoiceable_id}`
  }

  return null
}

interface ProcessedFile {
  linked: boolean
  model?: string
  id?: number
  error?: string
}

// Convert processed files into an array
const processedFilesArray = computed<ProcessedFile[]>(() => {
  const files = invoiceTmUploadJob.value?.processed_data?.processed_files || {}

  return Object.entries(files).map(([uuid, data]) => ({
    ...(data as ProcessedFile), // Ensure data is treated as the correct type
    uuid, // Extract UUID from the key
    model: data.model?.split('\\').pop() || '', // Extract last part of model path
  }))
})

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.invoices.getInvoiceTmUploadJob(props.id)) as any
    invoiceTmUploadJob.value = response
    // if processed_data not null convert to object
    if (invoiceTmUploadJob.value.processed_data) {
      invoiceTmUploadJob.value.processed_data = JSON.parse(invoiceTmUploadJob.value.processed_data)
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()
</script>
