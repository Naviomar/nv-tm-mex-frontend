<template>
  <div>
    <v-card class="py-4" color="grey-lighten-4">
      <v-card-title>
        <h3>Line - Credit note #{{ creditNote.id }} Details</h3>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div class="grid grid-cols-2 gap-1">
              <div>Folio</div>
              <div>#{{ creditNote.id }}</div>
              <div>Credit note type</div>
              <div>{{ creditNote.inv_type }}</div>
              <div>Line</div>
              <div>{{ creditNote.line?.name }}</div>
              <div>Amount</div>
              <div>{{ formatToCurrency(creditNote.amount) }}</div>
              <div>Amount available</div>
              <div>{{ formatToCurrency(creditNote.amount_available) }}</div>
              <div>Comments</div>
              <div>{{ creditNote.description }}</div>
            </div>
          </div>
          <div>
            <div>{{ creditNoteInvoice }}</div>
            <div>Reference #{{ referenciaNumber }}</div>
            <div class="flex gap-4">
              <v-btn color="primary" size="small" variant="outlined" @click="downloadPdf">Download Pdf</v-btn>
              <v-btn color="primary" size="small" variant="outlined" @click="emailCreditNote">Email</v-btn>
            </div>
          </div>
        </div>

        <v-card class="py-4">
          <div class="grid grid-cols-1 md:grid-cols-12">
            <div class="col-span-1 md:col-span-3 px-2">
              <h1 class="text-3xl font-bold text-gray-800">Pay same line invoices using</h1>
              <div class="max-w-xs mx-auto bg-white rounded-lg shadow-md overflow-hidden mt-2">
                <div class="bg-gray-100 px-4 py-2">
                  <h2 class="text-lg font-medium text-gray-800">Credit Note #{{ creditNote.id }}</h2>
                </div>
                <div class="px-4 py-5 sm:p-6">
                  <div class="flex flex-col items-start justify-between mb-2">
                    <span class="text-sm font-medium text-gray-600">Line</span>
                    <span class="text-lg font-medium text-gray-800">{{ creditNote.line?.name }}</span>
                  </div>
                  <div class="flex flex-row items-center justify-between mb-4">
                    <div class="flex flex-col items-start">
                      <span class="text-sm font-medium text-gray-600">Created at</span>
                      <span class="text-lg font-medium text-gray-800">{{
                        formatDateOnlyString(creditNote.created_at)
                      }}</span>
                    </div>
                  </div>
                  <div class="flex flex-row items-center justify-between">
                    <div class="flex flex-col items-start">
                      <span class="text-sm font-medium text-gray-600">Amount</span>
                      <span class="text-lg font-medium text-gray-800">{{ formatToCurrency(creditNote.amount) }}</span>
                    </div>
                    <div class="flex flex-col items-start">
                      <span class="text-sm font-medium text-gray-600">Available Balance</span>
                      <span class="text-lg font-bold text-gray-800">{{
                        formatToCurrency(creditNote.amount_available)
                      }}</span>
                    </div>
                  </div>
                  <div class="flex flex-col items-center justify-end bg-slate-100">
                    <span class="text-sm font-medium text-gray-600">Used</span>
                    <span class="text-lg font-medium text-gray-800">{{
                      formatToCurrency(creditNote.amount - creditNote.amount_available)
                    }}</span>
                  </div>
                  <div class="flex flex-col items-center justify-end bg-slate-200">
                    <span class="text-sm font-medium text-gray-600">Amount to Pay</span>
                    <span class="text-lg font-medium text-gray-800">{{ formatToCurrency(amountToPayTotal) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-1 md:col-span-9">
              <v-card class="mb-4">
                <v-card-title>
                  <div class="flex justify-between">
                    <div class="flex items-center gap-2">
                      <v-icon size="x-small">mdi-receipt-text-outline</v-icon>
                      <div>Existing payments</div>
                    </div>
                    <div>
                      <v-btn icon size="x-small" @click="showPayments = !showPayments" color="blue-grey-darken-2">
                        <v-icon v-if="showPayments">mdi-eye-outline</v-icon>
                        <v-icon v-if="!showPayments">mdi-eye-closed</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-card-title>
                <v-card-text v-if="showPayments">
                  <v-table density="compact" fixed-header>
                    <thead>
                      <tr>
                        <th class="font-bold!">Invoice #</th>
                        <th class="font-bold!">Concept</th>
                        <th class="font-bold!">Amount</th>
                        <th class="font-bold!">Paid</th>
                        <th class="font-bold!">Pending</th>
                        <th class="font-bold!">Status</th>
                        <th class="font-bold!">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(payment, index) in creditNote.payments"
                        :key="`pay-${index}`"
                        :id="`payment-${payment.id}`"
                      >
                        <td>
                          <v-chip color="blue" text-color="white" small @click="viewInvoice(payment)">
                            <v-icon>mdi-eye-outline</v-icon>{{ getInvoiceableType(payment) }} Invoice #{{
                              payment.chargeable?.invoice?.invoiceable_id
                            }}
                          </v-chip>
                        </td>
                        <td>{{ payment.chargeable?.charge?.name }}</td>
                        <td>{{ formatToCurrency(payment.chargeable?.amount + payment.chargeable?.amount_iva) }}</td>
                        <td>{{ formatToCurrency(payment.amount) }}</td>
                        <td>{{ formatToCurrency(payment.chargeable?.pending_balance) }}</td>
                        <td>
                          <v-chip
                            :color="payment.chargeable?.pending_balance > 0 ? 'red' : 'green'"
                            text-color="white"
                            small
                            class="capitalize"
                          >
                            {{ payment.chargeable?.pending_balance > 0 ? 'Pending' : 'Paid' }}
                          </v-chip>
                        </td>
                        <td>{{ formatDateString(payment.created_at) }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>

              <v-card v-if="hasCreditNoteAmountAvailable" color="blue-grey-lighten-5" class="mb-4">
                <v-card-title>
                  <div class="flex justify-between">
                    <div class="flex items-center gap-2">
                      <v-icon size="x-small">mdi-receipt-text-plus-outline</v-icon>
                      <div>Search & pay service invoice(s)</div>
                    </div>
                  </div>
                </v-card-title>
                <v-card-text>
                  <!-- // Posiblemente se necesite un componente para buscar y pagar facturas -->
                  <div class="mb-4">
                    <div class="grid grid-cols-2 gap-4">
                      <v-autocomplete
                        v-model="filters.typeInvoice"
                        :items="typeInvoicesForCreditNote"
                        density="compact"
                        item-title="name"
                        item-value="value"
                        label="Search invoice"
                        @update:model-value="clearSearchInvoices"
                      />
                      <div>
                        <span class="text-sm">Press ENTER to add the invoice number to search</span>
                        <v-text-field
                          v-model="filters.invoiceNumber"
                          density="compact"
                          label="Add Invoice numbers to search"
                          @keyup.enter="addInvoiceToSearch"
                        />
                      </div>
                    </div>
                    <div v-if="filters.invoices.length > 0">
                      <div>Search by</div>
                      <div>
                        <v-chip
                          v-for="(invoiceNum, index) in filters.invoices"
                          :key="`inv-${invoiceNum}`"
                          closable
                          class="mr-2 mb-2"
                          @click:close="removeInvoiceToSearch(index)"
                        >
                          {{ invoiceNum }}
                        </v-chip>
                      </div>
                      <v-btn color="primary" :loading="loadingStore.loading" class="mt-4" @click="searchInvoices"
                        >Search invoice(s)</v-btn
                      >
                    </div>
                  </div>

                  <v-alert
                    v-if="invoicesFound.length > 0 && invoicesFoundSelected.length <= 0"
                    density="compact"
                    variant="outlined"
                    type="info"
                    dense
                  >
                    Add invoice(s) to pay it using the line credit note
                  </v-alert>
                  <div v-if="invoicesFound.length > 0" class="py-4">
                    <div>Found invoice(s)</div>
                    <v-chip
                      v-for="(invoice, index) in invoicesFound"
                      :key="`inv-found-${index}`"
                      color="green-darken-4"
                      class="mr-2 mb-2"
                      append-icon="mdi-plus"
                      @click="addInvoiceToPay(invoice)"
                    >
                      {{ getInvoiceableName(invoice) }} #{{ invoice.invoiceable_id }}
                    </v-chip>
                  </div>
                  <div v-if="invoicesFoundSelected.length > 0" class="py-4">
                    <div class="font-bold text-xl">Invoice(s) added to pay</div>
                    <div v-for="(invoiceToPay, index) in invoicesFoundSelected" :key="`inv-selected-${index}`">
                      <v-table density="compact" fixed-header>
                        <thead>
                          <tr>
                            <th class="font-bold! w-4">Actions</th>
                            <th class="font-bold!">Invoice #</th>
                            <th class="font-bold!">Charge</th>
                            <th class="font-bold!">Amount</th>
                            <th class="font-bold!">Pending balance</th>
                            <th class="font-bold!">Pay amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(charge, index2) in invoiceToPay.charges"
                            :key="`inv-selected-${index}-charge-${index2}`"
                          >
                            <td>
                              <v-btn
                                color="red"
                                size="x-small"
                                icon
                                @click="removeChargeToInvoiceToPay(invoiceToPay, index, index2)"
                              >
                                <v-icon>mdi-close</v-icon>
                              </v-btn>
                            </td>
                            <td>{{ getInvoiceableName(invoiceToPay) }} #{{ invoiceToPay.invoiceable_id }}</td>
                            <td>{{ charge.charge?.name }}</td>
                            <td>{{ formatToCurrency(parseFloat(charge.amount) + parseFloat(charge.amount_iva)) }}</td>
                            <td>{{ formatToCurrency(charge.pending_balance) }}</td>
                            <td>
                              <v-text-field
                                v-model="charge.amount_to_pay"
                                type="number"
                                density="compact"
                                :rules="[(v) => !!v || 'Amount is required']"
                                @update:model-value="checkMaxAmountToPay($event, charge)"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </div>
                    <v-btn color="primary" :loading="loadingStore.loading" @click="payInvoices"
                      >Set payment to invoice(s) {{ formatToCurrency(amountToPayTotal) }}</v-btn
                    >
                  </div>

                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-card>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
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

const showPayments = ref(true)
const creditNote = ref<any>(null)
const invoicesFound = ref<any>([])
const invoicesFoundSelected = ref<any>([])

const filters = ref<any>({
  typeInvoice: null,
  invoiceNumber: '',
  invoices: [],
})

const getCreditNote = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.lines.getCreditNoteById(props.id)
    creditNote.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getCreditNote()

const downloadPdf = () => {
  console.log('Download pdf')
}

const emailCreditNote = () => {
  console.log('Email credit note')
}

const creditNoteInvoice = computed(() => {
  if (!creditNote.value) {
    return ''
  }
  const invMorphType = getInvoiceType(creditNote.value?.invoice)
  return `${invMorphType} #${creditNote.value?.invoice?.invoiceable_id}`
})

const referenciaNumber = computed(() => {
  if (!creditNote.value) {
    return ''
  }
  return creditNote.value?.invoice?.invoiceable?.referencia?.reference_number
})

const getInvoiceType = (invoice: any) => {
  const invoiceableType = invoice.invoiceable_type
  if (invoiceableType.includes('LineInvoiceRef')) {
    return 'Line Invoice Ref'
  }
  return 'Unknown'
}

const getInvoiceableType = (payment: any) => {
  const invoiceableType = payment.chargeable?.invoice?.invoiceable_type
  if (!invoiceableType) {
    return 'Unknown'
  }
  if (invoiceableType.includes('\LineInvoiceRef')) {
    return 'Freight'
  }
  return 'Unknown'
}

const typeInvoices = ref([
  { value: 'tm', name: 'Line Invoice TM' },
  { value: 'wm', name: 'Line Invoice WM' },
])

const typeInvoicesForCreditNote = computed(() => {
  if (!creditNote.value) return []
  if (creditNote.value.inv_type === 'tm') {
    return typeInvoices.value.filter((type) => type.value === 'tm')
  }
  if (creditNote.value.inv_type === 'wm') {
    return typeInvoices.value.filter((type) => type.value === 'wm')
  }
  return []
})

const addInvoiceToSearch = () => {
  if (filters.value.invoiceNumber) {
    // split by comma and remove empty spaces
    filters.value.invoiceNumber = filters.value.invoiceNumber.replace(/\s/g, '')
    const refs = Array.from(new Set(filters.value.invoiceNumber.split(',')))
    // remove duplicates in refs array using set

    refs.forEach((ref) => {
      filters.value.invoices.push(ref)
    })
    filters.value.invoices = [...new Set(filters.value.invoices)]
    filters.value.invoiceNumber = ''
  }
}

const removeInvoiceToSearch = (index: number) => {
  filters.value.invoices?.splice(index, 1)
}

const clearSearchInvoices = () => {
  filters.value.invoices = []
}

const addInvoiceToPay = (invoice: any) => {
  // if invoice is already in the list, do not add it
  if (invoicesFoundSelected.value.find((inv: any) => inv.id === invoice.id)) {
    return
  }
  // The toRaw function returns the original object that was passed to reactive or ref to make it reactive.
  // It doesn't create a clone or a deep copy of the object; instead, it returns a reference to the original object.
  // const invoiceData = toRaw(invoice)
  const invoiceData = JSON.parse(JSON.stringify(invoice))
  // set amount_to_pay to pending_balance
  invoiceData.charges.forEach((charge: any) => {
    charge.amount_to_pay = charge.pending_balance
  })
  invoicesFoundSelected.value.push(invoiceData)
}

const removeInvoiceToPay = (index: number) => {
  console.log('removeInvoiceToPay', index)
  invoicesFoundSelected.value.splice(index, 1)
}

const removeChargeToInvoiceToPay = (invoice: any, invoiceIndex: number, indexCharge: number) => {
  invoice.charges.splice(indexCharge, 1)
  // remove invoice if no charges
  if (invoice.charges.length <= 0) {
    removeInvoiceToPay(invoiceIndex)
  }
}

const getInvoiceableName = (invoice: any) => {
  const invoiceableType = invoice.invoiceable_type
  if (invoiceableType.includes('InvoiceSeaTm')) {
    return 'Sea TM invoice'
  }
  if (invoiceableType.includes('InvoiceSeaWm')) {
    return 'Sea WM invoice'
  }
  if (invoiceableType.includes('FfPayment')) {
    return 'F.F. Payment invoice'
  }
  if (invoiceableType.includes('LineInvoiceRef')) {
    return 'Freight invoice'
  }
  return 'Unknown'
}

const checkMaxAmountToPay = (value: any, charge: any) => {
  if (value > charge.pending_balance) {
    charge.amount_to_pay = charge.pending_balance
  }
}

const amountToPayTotal = computed(() => {
  let total = 0
  invoicesFoundSelected.value.forEach((invoice: any) => {
    invoice.charges.forEach((charge: any) => {
      let amountToPay = parseFloat(charge.amount_to_pay)
      if (isNaN(amountToPay)) amountToPay = 0
      total += amountToPay
    })
  })
  return total
})

const hasCreditNoteAmountAvailable = computed(() => {
  return creditNote.value.amount_available > 0
})

const payInvoices = async () => {
  try {
    loadingStore.loading = true
    const chargesToPay = [] as any
    invoicesFoundSelected.value.forEach((invoice: any) => {
      invoice.charges.forEach((charge: any) => {
        chargesToPay.push({
          invoice_id: charge.invoice_id,
          chargeable_type: charge.chargeable_type,
          chargeable_id: charge.chargeable_id,
          charge_id: charge.charge_id,
          amount_to_pay: charge.amount_to_pay || 0,
        })
      })
    })

    const body = {
      payments: chargesToPay,
    }
    const response = await $api.lines.creditNotePayInvoices(creditNote.value.id, body)

    snackbar.add({ type: 'success', text: 'Invoices paid successfully' })
    // clear all
    invoicesFound.value = []
    invoicesFoundSelected.value = []
    showPayments.value = true
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const searchInvoices = async () => {
  try {
    invoicesFound.value = []
    loadingStore.loading = true
    const response: any = await $api.lines.creditNoteSearchPayableInvoices(creditNote.value.id, filters.value)

    if (response.length <= 0) {
      snackbar.add({ type: 'warning', text: 'No invoices found' })
    }

    invoicesFound.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const viewInvoice = (payment: any) => {
  const invoiceableType = payment.chargeable?.invoice?.invoiceable_type
  if (invoiceableType.includes('LineInvoiceRef')) {
    router.push(`/invoices/lines/notes/view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  snackbar.add({ type: 'error', text: 'Unknown invoice type' })
}
</script>
