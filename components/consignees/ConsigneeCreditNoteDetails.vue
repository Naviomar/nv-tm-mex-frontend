<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <v-card class="mb-4">
        <v-card-title>
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div class="font-bold">
              {{ creditNote.type === 'party' ? 'Free Format' : 'Customer' }} Credit Note #{{ creditNote.id }}
            </div>
            <div class="flex flex-wrap gap-2 items-center">
              <v-chip :color="creditNote.type === 'party' ? 'purple' : 'blue'" size="small">
                {{ creditNote.type === 'party' ? 'Free Format' : 'Customer' }}
              </v-chip>
              <v-chip color="orange" size="small" v-if="creditNote.inv_type">
                {{ creditNote.inv_type?.toUpperCase() }}
              </v-chip>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <!-- Party/Customer Information Card -->
          <v-card variant="tonal" color="blue" class="mb-4">
            <v-card-text>
              <div class="flex items-start gap-3">
                <v-icon size="32" color="blue-darken-2">{{ creditNote.type === 'party' ? 'mdi-domain' : 'mdi-account-circle' }}</v-icon>
                <div class="flex-1">
                  <div class="text-xs text-blue-darken-1 font-semibold mb-1">{{ creditNote.type === 'party' ? 'PARTY' : 'CUSTOMER' }}</div>
                  <div class="font-bold text-base">
                    {{ creditNote.type === 'party' ? (creditNote.party_invoice?.partyable?.name || '-') : creditNote.consignee?.name }}
                  </div>
                  <div v-if="creditNote.type === 'customer' && creditNote.consignee?.consignee_group?.name" class="text-sm mt-1">
                    <span class="text-grey-darken-1">Group:</span> <span class="font-semibold">{{ creditNote.consignee.consignee_group.name }}</span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Amount Information Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <v-card variant="tonal" color="green">
              <v-card-text>
                <div class="flex items-start gap-3">
                  <v-icon size="32" color="green-darken-2">mdi-cash-multiple</v-icon>
                  <div class="flex-1">
                    <div class="text-xs text-green-darken-1 font-semibold mb-1">AMOUNT</div>
                    <div class="font-bold text-xl">{{ creditNote.currency?.name }} {{ formatToCurrency(creditNote.amount) }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-card variant="tonal" color="teal">
              <v-card-text>
                <div class="flex items-start gap-3">
                  <v-icon size="32" color="teal-darken-2">mdi-wallet</v-icon>
                  <div class="flex-1">
                    <div class="text-xs text-teal-darken-1 font-semibold mb-1">AVAILABLE</div>
                    <div class="font-bold text-xl">{{ formatToCurrency(creditNote.amount_available) }}</div>
                    <div class="text-sm mt-1">
                      <span class="text-grey-darken-1">Used:</span> {{ formatToCurrency(creditNote.amount - creditNote.amount_available) }}
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Folios Card -->
          <v-card variant="tonal" color="purple" class="mb-4">
            <v-card-text>
              <div class="flex items-center gap-2 mb-3">
                <v-icon color="purple-darken-2">mdi-file-document-outline</v-icon>
                <div class="text-sm font-bold text-purple-darken-2">FOLIO INFORMATION</div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div class="text-xs text-grey-darken-1 mb-1">Internal Folio</div>
                  <div class="font-semibold">#{{ creditNote.id }}</div>
                </div>
                <div>
                  <div class="text-xs text-grey-darken-1 mb-1">External Folio</div>
                  <div class="font-semibold">{{ creditNote.external_folio || '-' }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Comments -->
          <v-card variant="tonal" color="orange" class="mb-4" v-if="creditNote.description">
            <v-card-text>
              <div class="flex items-start gap-3">
                <v-icon color="orange-darken-2">mdi-comment-text</v-icon>
                <div class="flex-1">
                  <div class="text-xs text-orange-darken-1 font-semibold mb-1">COMMENTS</div>
                  <div class="font-medium">{{ creditNote.description }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-divider class="my-4"></v-divider>
          <div class="flex flex-col sm:flex-row gap-2">
            <PreviewCustomerCreditNote :id="creditNote.id" />
            <v-btn v-if="false" color="primary" size="small" variant="outlined" @click="emailCreditNote">
              <v-icon>mdi-email-outline</v-icon>Email
            </v-btn>
          </div>

          <v-alert v-if="creditNote.deleted_at" density="compact" type="error" elevation="2" class="mt-4">
            <div>This credit note was deleted at {{ formatDateString(creditNote.deleted_at) }}</div>
            <div>Deleted by: {{ creditNote.deletor?.name }}</div>
          </v-alert>
        </v-card-text>
      </v-card>

      <div>
        <!-- Linked Invoices Card -->
        <v-card color="grey-lighten-4" class="mb-4">
          <v-card-title><div class="font-bold">Linked Invoices</div></v-card-title>
          <v-card-text>
            <template v-if="creditNote.type === 'party'">
              <v-chip v-for="(pi, idx) in allPartyInvoices" :key="`cn-pi-${idx}`" variant="outlined" size="small" color="purple" class="mr-1 mb-1">
                Invoice #{{ pi.invoice?.invoice_number }}
              </v-chip>
              <div v-if="allPartyInvoices.length === 0" class="text-grey-darken-1 text-sm">No invoices linked</div>
            </template>
            <template v-else>
              <v-chip v-for="(inv, idx) in linkedInvoices" :key="`cn-inv-${idx}`" variant="outlined" size="small" class="mr-1 mb-1">
                {{ getInvoiceType(inv) }} #{{ inv.invoice_number }}
              </v-chip>
              <div v-if="linkedInvoices.length === 0" class="text-grey-darken-1 text-sm">No invoices linked</div>
            </template>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Concepts Table -->
    <div class="mb-4" v-if="creditNote.charges && creditNote.charges.length > 0">
      <v-card>
        <v-card-title><div class="font-bold">Concepts ({{ creditNote.charges.length }})</div></v-card-title>
        <v-card-text>
          <div class="overflow-x-auto">
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-bold! w-5">#</th>
                  <th class="font-bold!">Concept</th>
                  <th class="font-bold!">Related Invoice</th>
                  <th class="font-bold! text-right">Amount</th>
                  <th class="font-bold! text-right">IVA</th>
                  <th class="font-bold! text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(ch, idx) in creditNote.charges" :key="`cn-ch-${idx}`">
                  <td>{{ idx + 1 }}</td>
                  <td>
                    <div class="font-medium">{{ ch.charge?.name || 'Concept' }}</div>
                  </td>
                  <td>
                    <v-chip v-if="ch.invoice_charge?.invoice?.invoice_number" size="x-small" variant="outlined">
                      Invoice #{{ ch.invoice_charge.invoice.invoice_number }}
                    </v-chip>
                    <span v-else class="text-grey-darken-1">-</span>
                  </td>
                  <td class="text-right">{{ formatToCurrency(ch.amount) }}</td>
                  <td class="text-right">{{ formatToCurrency(ch.amount_iva || 0) }}</td>
                  <td class="text-right font-semibold">{{ formatToCurrency(parseFloat(ch.amount) + parseFloat(ch.amount_iva || 0)) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="5" class="text-right font-bold">Total Credit Note</td>
                  <td class="font-bold text-right">{{ formatToCurrency(creditNote.amount) }}</td>
                </tr>
              </tfoot>
            </v-table>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Payment Section -->

        <v-card class="py-4">
          <div class="grid grid-cols-1 md:grid-cols-12">
            <div class="col-span-1 md:col-span-3 px-2">
              <h1 v-if="creditNote.type !== 'party'" class="text-lg font-bold leading-none">Pay same customer/group invoices using</h1>
              <h1 v-else class="text-lg font-bold leading-none">Credit Note Summary</h1>
              <div class="max-w-xs mx-auto bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden mt-2">
                <div class="px-4 py-2">
                  <h2 class="text-lg font-medium">Credit Note #{{ creditNote.id }}</h2>
                </div>
                <div class="px-4 py-5 sm:p-6">
                  <div class="flex flex-col items-start justify-between mb-2">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ creditNote.type === 'party' ? 'Party' : 'Customer' }}</span>
                    <span class="text-base font-medium">{{ creditNote.type === 'party' ? creditNote.party_invoice?.partyable?.name : creditNote.consignee?.name }}</span>
                  </div>
                  <div class="flex flex-row items-center justify-between mb-4">
                    <div class="flex flex-col items-start">
                      <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Created at</span>
                      <span class="text-lg font-medium">{{ formatDateOnlyString(creditNote.created_at) }}</span>
                    </div>
                  </div>
                  <div class="flex flex-row items-center justify-between">
                    <div class="flex flex-col items-start">
                      <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Amount</span>
                      <span class="text-lg font-medium">{{ formatToCurrency(creditNote.amount) }}</span>
                    </div>
                    <div class="flex flex-col items-start">
                      <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Available Balance</span>
                      <span class="text-lg font-bold">{{ formatToCurrency(creditNote.amount_available) }}</span>
                    </div>
                  </div>
                  <div class="flex flex-col items-center justify-end">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Used</span>
                    <span class="text-lg font-medium">{{
                      formatToCurrency(creditNote.amount - creditNote.amount_available)
                    }}</span>
                  </div>
                  <div class="flex flex-col items-center justify-end bg-slate-200 dark:bg-slate-700">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Amount to Pay</span>
                    <span class="text-lg font-medium">{{ formatToCurrency(amountToPayTotal) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-1 md:col-span-9">
              <v-card v-if="creditNote.type === 'customer'" class="mb-4">
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
                              payment.chargeable?.invoice?.invoice_number
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
                        <td class="whitespace-nowrap">
                          <UserInfoBadge :item="payment">
                            {{ formatDateString(payment.created_at) }}
                          </UserInfoBadge>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>

              <v-card v-if="creditNote.type !== 'party' && hasCreditNoteAmountAvailable && !isDeleted" color="blue-grey-lighten-5" class="mb-4">
                <v-card-title>
                  <div class="flex justify-between">
                    <div class="flex items-center gap-2">
                      <v-icon size="x-small">mdi-receipt-text-plus-outline</v-icon>
                      <div>Search & pay service invoice(s)</div>
                    </div>
                  </div>
                </v-card-title>
                <v-card-text>
                  <div class="mb-2">Note: Credit note can be used to any consignee group</div>
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
                        hide-details
                        @update:model-value="clearSearchInvoices"
                      />
                      <v-autocomplete
                        v-model="filters.inv_service"
                        density="compact"
                        :items="['sea', 'air']"
                        label="Service type *"
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
                  </div>

                  <v-alert
                    v-if="invoicesFound.length > 0 && invoicesFoundSelected.length <= 0"
                    density="compact"
                    variant="outlined"
                    type="info"
                    dense
                  >
                    Add invoice(s) to pay it using the consignee credit note
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

const showPayments = ref(true)
const creditNote = ref<any>(null)
const invoicesFound = ref<any>([])
const invoicesFoundSelected = ref<any>([])
const chargeCfdiNames = ref<any>([])

const filters = ref<any>({
  typeInvoice: null,
  inv_service: null,
  invoiceNumber: '',
  invoices: [],
})

const getCreditNote = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.consigneeCreditNotes.getCreditNoteById(props.id)
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
  return `${invMorphType} #${creditNote.value?.invoice?.invoice_number} related to credit note`
})

const referenciaNumber = computed(() => {
  if (!creditNote.value) {
    return ''
  }
  return creditNote.value?.invoice?.invoiceable?.referencia?.reference_number
})

// Linked invoices - M2M invoices array
const linkedInvoices = computed(() => {
  if (creditNote.value?.invoices?.length > 0) return creditNote.value.invoices
  if (creditNote.value?.invoice) return [creditNote.value.invoice]
  return []
})

// All party invoices - M2M party_invoices array
const allPartyInvoices = computed(() => {
  const invoices = []
  if (creditNote.value?.party_invoice) invoices.push(creditNote.value.party_invoice)
  if (creditNote.value?.party_invoices?.length > 0) invoices.push(...creditNote.value.party_invoices)
  // Remove duplicates by invoice_id
  const seen = new Set()
  return invoices.filter(pi => {
    if (!pi?.invoice?.id) return false
    if (seen.has(pi.invoice.id)) return false
    seen.add(pi.invoice.id)
    return true
  })
})

const getInvoiceType = (invoice: any) => {
  const invoiceableType = invoice.invoiceable_type
  if (invoiceableType.includes('InvoiceSeaTm')) {
    return 'Customer Invoice Sea TM'
  }
  if (invoiceableType.includes('InvoiceSeaWm')) {
    return 'Customer Invoice Sea WM'
  }
  if (invoiceableType.includes('InvoiceAirTm')) {
    return 'Customer Invoice Air TM'
  }
  if (invoiceableType.includes('InvoiceAirWm')) {
    return 'Customer Invoice Air WM'
  }
  return 'Unknown'
}

const getInvoiceableType = (payment: any) => {
  const invoiceableType = payment.chargeable?.invoice?.invoiceable_type
  if (!invoiceableType) {
    return 'Unknown'
  }
  if (invoiceableType.includes('InvoiceSeaTm')) {
    return 'Sea TM'
  }
  if (invoiceableType.includes('InvoiceSeaWm')) {
    return 'Sea WM'
  }
  if (invoiceableType.includes('InvoiceAirTm')) {
    return 'Air TM'
  }
  if (invoiceableType.includes('InvoiceAirWm')) {
    return 'Air WM'
  }
  return 'Unknown'
}

const typeInvoices = ref([
  { value: 'tm', name: 'Customer Invoice TM' },
  { value: 'wm', name: 'Customer Invoice WM' },
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

const isDeleted = computed(() => {
  return creditNote.value.deleted_at
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
    const response = await $api.consigneeCreditNotes.payInvoices(creditNote.value.id, body)

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
    if (!filters.value.typeInvoice || !filters.value.inv_service || filters.value.invoices.length <= 0) {
      snackbar.add({ type: 'warning', text: 'Please fill all fields' })
      return
    }
    invoicesFound.value = []
    loadingStore.loading = true
    const response: any = await $api.consigneeCreditNotes.searchPayableInvoices(creditNote.value.id, filters.value)

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

const getChargeCfdiNames = async () => {
  try {
    loadingStore.start()
    const response = await $api.charges.getAllCfdiNames()

    chargeCfdiNames.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const viewInvoice = (payment: any) => {
  const invoiceableType = payment.chargeable?.invoice?.invoiceable_type
  if (invoiceableType.includes('InvoiceSeaTm')) {
    router.push(`/invoices/search/tm-view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('InvoiceSeaWm')) {
    router.push(`/invoices/search/wm-view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  // snackbar show error
  snackbar.add({ type: 'error', text: 'Unknown invoice type' })
}

await getChargeCfdiNames()
</script>
