<template>
  <div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <v-card>
          <v-card-title>
            <h3>Search a freight line invoice</h3>
          </v-card-title>
          <v-card-subtitle> Search an invoice to be able to create the credit note. </v-card-subtitle>
          <v-card-text>
            <div>
              <div class="grid grid-cols-2 gap-4">
                <v-autocomplete
                  v-model="filters.inv_type"
                  density="compact"
                  :items="['tm', 'wm']"
                  label="Invoice type"
                />
                <v-text-field v-model="filters.folio" density="compact" type="text" label="Line Invoice (Folio) #" />
              </div>
              <div class="flex">
                <v-btn color="primary" size="small" @click="searchInvoices"> Search invoice </v-btn>
              </div>
            </div>
            <v-divider />
            <div v-if="hasInvoice" class="py-4">
              <div class="text-lg font-bold">
                Credit Note for - {{ invoiceResult.invoice.line_invoice?.line?.name_code }}
              </div>
              <v-text-field v-model="form.folio" density="compact" label="Folio *" />
              <v-text-field v-model="form.amount" type="number" density="compact" label="Amount *" />
              <v-file-input v-model="form.file" density="compact" label="Attachment" />

              <v-textarea v-model="form.description" density="compact" label="Comments *" />
              <div class="flex justify-end">
                <v-btn color="primary" @click="saveCreditNote"> Create credit note </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
      <div v-if="hasInvoice">
        <v-card>
          <v-card-title class="text-wrap">
            <h3>{{ invoiceResult.invoice.line_invoice?.line?.name_code }} - invoice & existing credit notes</h3>
          </v-card-title>
          <v-card-text>
            <v-card>
              <v-card-title>
                <h4>
                  Freight Invoice {{ invoiceResult.inv_type.toUpperCase() }} #{{
                    invoiceResult.invoice?.line_invoice?.serie_folio
                  }}
                  <v-btn color="primary" size="small" variant="outlined" @click="viewLineInvoice"> View invoice</v-btn>
                </h4>
              </v-card-title>
              <v-card-text>
                <div>
                  <p>Line: {{ invoiceResult.invoice.line_invoice?.line?.name_code }}</p>
                  <p>Sea reference # {{ invoiceResult.invoice.referencia?.reference_number }}</p>
                  <p>Amount: {{ getInvoiceCurrenciesTotal(invoiceResult.invoice) }}</p>
                  <p>Date: {{ formatDateString(invoiceResult.invoice.created_at) }}</p>
                </div>
              </v-card-text>
            </v-card>

            <v-card>
              <v-card-title>
                <h4>Last credit notes for {{ invoiceResult.invoice.line_invoice?.line?.name_code }}</h4>
              </v-card-title>
              <v-card-text>
                <div v-if="invoiceResult.lastCreditNotes.length <= 0">
                  <p>No credit notes found in the past.</p>
                </div>
                <div v-for="(cn, index) in invoiceResult.lastCreditNotes" :key="`last-cn-${index}`">
                  <v-divider />
                  <div class="flex justify-between mb-4">
                    <div>
                      <p>Credit note #{{ cn.id }}</p>
                      <p>Amount: {{ formatToCurrency(cn.amount) }}</p>
                      <p>Date: {{ formatDateString(cn.created_at) }}</p>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = reactive({
  inv_type: '',
  folio: '',
})

const invoiceResult = ref<any>({
  inv_type: '',
  invoice: null,
  lastCreditNotes: [],
})

const form = reactive({
  folio: null,
  amount: 0,
  file: null,
  description: '',
})

const hasInvoice = computed(() => invoiceResult.value.invoice != null)

const viewLineInvoice = () => {
  router.push(`/invoices/lines/notes/view-${invoiceResult.value.invoice.line_invoice?.id}`)
}

const searchInvoices = async () => {
  try {
    if (!filters.inv_type || !filters.folio) {
      snackbar.add({ type: 'warning', text: 'Please fill all fields' })
      return
    }
    invoiceResult.value = {
      inv_type: '',
      invoice: null,
      lastCreditNotes: [],
    }
    loadingStore.start()
    const body = {
      inv_type: filters.inv_type,
      folio: filters.folio,
    }
    const response: any = await $api.lines.searchInvoice(body)
    invoiceResult.value = response
    invoiceResult.value.inv_type = filters.inv_type
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveCreditNote = async () => {
  try {
    if (!form.amount || !form.description || !form.folio) {
      snackbar.add({ type: 'warning', text: 'Please fill all fields' })
      return
    }
    loadingStore.start()
    const body = {
      line_id: invoiceResult.value.invoice.line_invoice?.line_id,
      folio: form.folio,
      amount: form.amount,
      file: form.file,
      description: form.description,
      inv_type: invoiceResult.value.inv_type,
      line_invoice_ref_id: invoiceResult.value.invoice.id,
      line_invoice_id: invoiceResult.value.invoice.line_invoice.id,
    }
    await $api.lines.createNote(body)
    snackbar.add({ type: 'success', text: 'Credit note created' })
    router.push('/invoices/lines/credit-notes')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
