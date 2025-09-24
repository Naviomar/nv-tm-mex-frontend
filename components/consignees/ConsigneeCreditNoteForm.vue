<template>
  <div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <v-card>
          <v-card-title>
            <h3>Search customer service invoice (Sea/Air - Import/Export)</h3>
          </v-card-title>
          <v-card-subtitle> Search an invoice to be able to create the credit note. </v-card-subtitle>
          <v-card-text>
            <div>
              <div class="grid grid-cols-2 gap-4">
                <v-autocomplete
                  v-model="filters.inv_type"
                  density="compact"
                  :items="['wm', 'tm']"
                  label="Invoice type"
                />
                <v-autocomplete
                  v-model="filters.inv_service"
                  density="compact"
                  :items="['sea', 'air']"
                  label="Service type"
                />
                <v-text-field v-model="filters.invoiceId" density="compact" type="text" label="Invoice #" />
              </div>
              <div class="flex">
                <v-btn color="primary" size="small" @click="searchInvoices"> Search invoice </v-btn>
              </div>
            </div>
            <v-divider />
            <div v-if="hasInvoice" class="py-4">
              <div class="text-lg font-bold mb-2">Credit Note for - {{ invoiceResult.invoice.consignee?.name }}</div>
              <v-text-field v-model="form.external_folio" density="compact" label="External folio" />
              <v-autocomplete
                v-model="form.charge_id"
                :items="onlyInvoiceConcepts"
                item-value="id"
                item-title="name"
                density="compact"
                label="Concept *"
              />
              <v-text-field
                v-model="form.amount"
                type="number"
                density="compact"
                label="Amount *"
                @input="validateAmount"
              />
              <v-autocomplete
                v-model="form.currency_id"
                :items="currencies"
                item-value="id"
                item-title="name"
                density="compact"
                label="Currency *"
                readonly
              />
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
          <v-card-title>
            <h3>{{ invoiceResult.invoice.consignee?.name }} - invoice & existing credit notes</h3>
          </v-card-title>
          <v-card-text>
            <v-card>
              <v-card-title>
                <h4>
                  Invoice {{ invoiceResult.inv_type }} #{{ invoiceResult.invoice?.invoice?.invoice_number }}
                  <v-btn color="primary" size="small" variant="outlined" @click="viewServiceInvoice">
                    View invoice</v-btn
                  >
                </h4>
              </v-card-title>
              <v-card-text>
                <div>
                  <p>Customer: {{ invoiceResult.invoice.consignee?.name }}</p>
                  <p>Linked services # {{ invoiceServices }}</p>
                  <p>
                    Amount: {{ getCurrencyName(invoiceResult.invoice?.invoice?.currency_id) }}
                    {{ formatToCurrency(invoiceResult.invoice?.invoice.total) }}
                  </p>
                  <p>Date: {{ formatDateString(invoiceResult.invoice.created_at) }}</p>
                </div>
              </v-card-text>
            </v-card>

            <v-card>
              <v-card-title>
                <h4>Last credit notes for {{ invoiceResult.invoice.consignee?.name }}</h4>
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
import { currencies } from '@/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = reactive({
  inv_type: null,
  inv_service: null,
  invoiceId: null,
})

const invoiceResult = ref<any>({
  inv_type: '',
  invoice: null,
  lastCreditNotes: [],
})

const catalogs = ref<any>({
  charges: [],
})

const form = reactive({
  external_folio: null,
  charge_id: null,
  amount: 0,
  currency_id: null,
  description: '',
})

const hasInvoice = computed(() => invoiceResult.value.invoice != null)

const invoiceServices = computed(() => {
  if (!invoiceResult.value.invoice) return '-'
  // get reference_number from services
  if (invoiceResult.value.invoice?.class_name.includes('Air')) {
    return invoiceResult.value.invoice.services
      .map((service: any) => service.air_reference?.reference_number)
      .join(', ')
  }
  if (invoiceResult.value.invoice?.class_name.includes('Sea')) {
    return invoiceResult.value.invoice.services.map((service: any) => service.referencia?.reference_number).join(', ')
  }
  return 'No services found'
})

const onlyInvoiceConcepts = computed(() => {
  if (!invoiceResult.value.invoice) return []
  // filter catalogs.charges by invoiceResult.invoice.invoice_charges.charge_id
  return catalogs.value.charges.filter((charge: any) =>
    invoiceResult.value.invoice.invoice_charges.map((ic: any) => ic.charge_id).includes(charge.id)
  )
})

const viewServiceInvoice = () => {
  if (invoiceResult.value.invoice.class_name.includes('Sea')) {
    if (invoiceResult.value.inv_type == 'tm') {
      router.push(`/invoices/search/tm-view-${invoiceResult.value.invoice.id}`)
      return
    }
    if (invoiceResult.value.inv_type == 'wm') {
      router.push(`/invoices/search/wm-view-${invoiceResult.value.invoice.id}`)
      return
    }
  }

  if (invoiceResult.value.invoice.class_name.includes('Air')) {
    if (invoiceResult.value.inv_type == 'tm') {
      router.push(`/invoices/search/tm-air-view-${invoiceResult.value.invoice.id}`)
      return
    }
    if (invoiceResult.value.inv_type == 'wm') {
      router.push(`/invoices/search/wm-air-view-${invoiceResult.value.invoice.id}`)
      return
    }
  }
}

const validateAmount = (e: any) => {
  if (e.target.value < 0) {
    form.amount = 0
  }
  // can't be more than the invoice amount
  if (e.target.value > parseFloat(invoiceResult.value.invoice.invoice.total)) {
    snackbar.add({ type: 'warning', text: 'Amount can not be greater than the invoice total' })
    form.amount = invoiceResult.value.invoice.invoice.total
  }
}

const searchInvoices = async () => {
  try {
    if (!filters.inv_type || !filters.invoiceId || !filters.inv_service) {
      snackbar.add({ type: 'warning', text: 'Please fill all fields' })
      return
    }
    invoiceResult.value = {
      inv_type: '',
      invoice: null,
      lastCreditNotes: [],
    }
    loadingStore.loading = true
    const body = {
      inv_type: filters.inv_type,
      inv_service: filters.inv_service,
      invoiceId: filters.invoiceId,
    }
    const response: any = await $api.consigneeCreditNotes.searchInvoice(body)
    invoiceResult.value = response
    invoiceResult.value.inv_type = filters.inv_type
    form.currency_id = response.invoice?.invoice?.currency_id
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
    if (!form.amount || !form.currency_id || !form.description || !form.charge_id) {
      snackbar.add({ type: 'warning', text: 'Please fill all fields' })
      return
    }
    loadingStore.loading = true
    const body = {
      consignee_id: invoiceResult.value.invoice.consignee.id,
      external_folio: form.external_folio,
      amount: form.amount,
      charge_id: form.charge_id,
      currency_id: form.currency_id,
      description: form.description,
      inv_type: invoiceResult.value.inv_type,
      inv_service: invoiceResult.value.invoice.class_name,
      invoice_class_name: invoiceResult.value.invoice.class_name,
      service_invoice_id: invoiceResult.value.invoice.id,
      invoice_id: invoiceResult.value.invoice.invoice.id,
    }
    await $api.consigneeCreditNotes.createNote(body)
    snackbar.add({ type: 'success', text: 'Credit note created' })
    router.push('/invoices/search/credit-notes')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.charges.getAll()

    catalogs.value.charges = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getCatalogs()
</script>
