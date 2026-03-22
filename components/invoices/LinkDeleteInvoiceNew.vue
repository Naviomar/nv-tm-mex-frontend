<template>
  <div>
    <v-btn color="orange" variant="tonal" size="small" @click="toggleDialog" :loading="loading">
      <v-icon>mdi-link-variant</v-icon>
      Link cancelled invoice (re-invoice)
    </v-btn>
    
    <v-dialog v-model="dialog" max-width="800" persistent>
      <v-card>
        <v-card-title class="bg-orange-lighten-5">
          <div class="flex items-center gap-2">
            <v-icon color="orange">mdi-link-variant</v-icon>
            <span>Link to Cancelled {{ invType }} Invoice</span>
          </div>
        </v-card-title>
        
        <v-card-subtitle class="pt-3">
          Select a cancelled invoice to link as the original for this re-invoice
        </v-card-subtitle>

        <v-card-text>
          <!-- Search by folio -->
          <div class="mb-4">
            <v-text-field
              v-model="searchFolio"
              density="compact"
              label="Search by invoice folio"
              prepend-inner-icon="mdi-magnify"
              clearable
              @update:model-value="searchByFolio"
              @click:clear="clearSearch"
              hint="Search by invoice number/folio"
              persistent-hint
            />
          </div>
          <!-- Info alert -->
          <v-alert v-if="!availableInvoices.length && !loading" type="info" variant="tonal" density="compact" class="mb-4">
            <div class="text-sm">
              <div class="font-semibold">No cancelled invoices available</div>
              <div>There are no cancelled {{ invType }} invoices for this {{ contextType }} that haven't been re-invoiced yet.</div>
            </div>
          </v-alert>

          <!-- Loading state -->
          <div v-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate color="orange"></v-progress-circular>
            <div class="mt-2 text-sm text-gray-600">Loading cancelled invoices...</div>
          </div>

          <!-- List of available invoices -->
          <div v-else-if="availableInvoices.length">
            <div class="space-y-2">
            <v-card
              v-for="invoice in availableInvoices"
              :key="invoice.id"
              :class="[
                'cursor-pointer transition-all',
                selectedInvoice?.id === invoice.id ? 'border-2 border-orange-500 bg-orange-50' : 'border hover:border-orange-300'
              ]"
              @click="selectInvoice(invoice)"
            >
              <v-card-text class="py-3">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <v-chip size="small" color="primary">
                        Invoice #{{ invoice.invoice?.invoice_number || invoice.id }}
                      </v-chip>
                      <v-chip size="small" color="red" variant="tonal">
                        Cancelled
                      </v-chip>
                      <v-chip v-if="invoice.consignee" size="x-small" variant="tonal">
                        {{ invoice.consignee.name }}
                      </v-chip>
                      <v-chip v-else-if="getInvoiceOwnerName(invoice)" size="x-small" variant="tonal">
                        {{ getInvoiceOwnerName(invoice) }}
                      </v-chip>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <span class="text-gray-600">Cancelled:</span>
                        <span class="font-medium ml-1">{{ formatDateString(invoice.cancelled_at) }}</span>
                      </div>
                      <div>
                        <span class="text-gray-600">Created:</span>
                        <span class="font-medium ml-1">{{ formatDateString(invoice.created_at) }}</span>
                      </div>
                      <div v-if="invoice.services?.length">
                        <span class="text-gray-600">References:</span>
                        <span class="font-medium ml-1">
                          {{ invoice.services.map((s: any) => s.referencia?.reference_number || s.air_reference?.reference_number).filter(Boolean).join(', ') }}
                        </span>
                      </div>
                      <div v-else-if="getInvoiceOwnerName(invoice)">
                        <span class="text-gray-600">Party:</span>
                        <span class="font-medium ml-1">{{ getInvoiceOwnerName(invoice) }}</span>
                      </div>
                      <div v-if="invoice.invoice?.total">
                        <span class="text-gray-600">Total:</span>
                        <span class="font-medium ml-1">{{ formatToCurrency(invoice.invoice.total) }}</span>
                      </div>
                    </div>
                    
                    <div v-if="invoice.cancelled_reason" class="mt-2 text-xs text-gray-600">
                      <span class="font-semibold">Reason:</span> {{ invoice.cancelled_reason }}
                    </div>
                  </div>

                  <div class="flex items-center">
                    <v-icon v-if="selectedInvoice?.id === invoice.id" color="orange" size="large">
                      mdi-check-circle
                    </v-icon>
                    <v-icon v-else color="gray" size="large">
                      mdi-radiobox-blank
                    </v-icon>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
          
          <!-- Load more button -->
          <div v-if="availableInvoices.length >= currentLimit" class="mt-4 text-center">
            <v-btn
              color="orange"
              variant="outlined"
              size="small"
              @click="loadMore"
              :loading="loading"
            >
              Load more invoices
            </v-btn>
          </div>
        </div>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-btn @click="closeDialog" variant="text">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            color="orange" 
            variant="flat"
            @click="confirmLink"
            :disabled="!selectedInvoice"
          >
            <v-icon left>mdi-link-variant</v-icon>
            Link Selected Invoice
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { formatToCurrency } from '@/utils/formatters'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const props = defineProps({
  invType: {
    type: String,
    required: true,
    validator: (value: string) => ['TM', 'WM'].includes(value)
  },
  referenceId: {
    type: String,
    default: null
  },
  airReferenceId: {
    type: String,
    default: null
  },
  consigneeId: {
    type: String,
    default: null
  },
  partyId: {
    type: String,
    default: null
  },
  partyType: {
    type: String,
    default: null
  },
  serviceType: {
    type: String,
    default: 'sea',
    validator: (value: string) => ['sea', 'air', 'free-format'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue'])

const dialog = ref(false)
const loading = ref(false)
const availableInvoices = ref<any[]>([])
const selectedInvoice = ref<any>(null)
const searchFolio = ref('')
const currentLimit = ref(5)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const contextType = computed(() => {
  if (props.referenceId || props.airReferenceId) return 'reference'
  if (props.consigneeId) return 'consignee'
  if (props.partyId) return 'party'
  return 'context'
})

const getInvoiceOwnerName = (invoice: any) => {
  return invoice?.consignee?.name || invoice?.partyable?.name || null
}

const toggleDialog = async () => {
  dialog.value = !dialog.value
  if (dialog.value) {
    await loadCancelledInvoices()
  }
}

const loadCancelledInvoices = async (append: boolean = false) => {
  loading.value = true
  if (!append) {
    selectedInvoice.value = null
  }
  
  try {
    const params: any = {
      limit: currentLimit.value
    }
    
    if (props.referenceId) {
      params.referencia_id = props.referenceId
    } else if (props.airReferenceId) {
      params.air_reference_id = props.airReferenceId
    }
    
    if (props.consigneeId) {
      params.consignee_id = props.consigneeId
    }
    
    if (props.partyId && props.partyType) {
      params.partyable_id = props.partyId
      params.partyable_type = props.partyType
    }

    if (searchFolio.value) {
      params.invoice_number = searchFolio.value
    }

    if (props.serviceType === 'free-format') {
      params.inv_type = props.invType
    }

    let response: any = []
    
    // Call appropriate API based on service type and inv type
    if (props.serviceType === 'free-format') {
      response = await $api.freeFormatInvoices.getCancelledForReInvoicing(params)
    } else if (props.serviceType === 'sea') {
      if (props.invType === 'TM') {
        response = await $api.tmInvoices.getCancelledForReInvoicing(params)
      } else {
        response = await $api.wmInvoices.getCancelledForReInvoicing(params)
      }
    } else {
      if (props.invType === 'TM') {
        response = await $api.tmAirInvoices.getCancelledForReInvoicing(params)
      } else {
        response = await $api.wmAirInvoices.getCancelledForReInvoicing(params)
      }
    }
    
    availableInvoices.value = Array.isArray(response) ? response : []
  } catch (error: any) {
    console.error('Error loading cancelled invoices:', error)
    snackbar.add({ 
      type: 'error', 
      text: error?.data?.message || 'Error loading cancelled invoices' 
    })
    availableInvoices.value = []
  } finally {
    loading.value = false
  }
}

const searchByFolio = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    currentLimit.value = 5
    loadCancelledInvoices()
  }, 500)
}

const clearSearch = () => {
  searchFolio.value = ''
  currentLimit.value = 5
  loadCancelledInvoices()
}

const loadMore = () => {
  currentLimit.value += 5
  loadCancelledInvoices()
}

const selectInvoice = (invoice: any) => {
  selectedInvoice.value = invoice
}

const confirmLink = () => {
  if (selectedInvoice.value) {
    emit('update:modelValue', selectedInvoice.value)
    snackbar.add({
      type: 'success',
      text: `Linked to cancelled invoice #${selectedInvoice.value.invoice?.invoice_number || selectedInvoice.value.id}`
    })
    closeDialog()
  }
}

const closeDialog = () => {
  dialog.value = false
  selectedInvoice.value = null
}
</script>
