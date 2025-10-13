<template>
  <div>
    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <v-card>
          <v-card-title>
            <h3>Customer Credit Note - Edit Form</h3>
          </v-card-title>
          <v-card-subtitle> Only credit notes not used can be edited. </v-card-subtitle>
          <v-card-text>
            <div class="py-4">
              <v-text-field v-model="consigneeCreditNote.external_folio" density="compact" label="External folio" />
              <v-autocomplete
                v-model="consigneeCreditNote.charge_id"
                :items="onlyInvoiceConcepts"
                item-value="id"
                item-title="name"
                density="compact"
                label="Concept *"
              />
              <v-text-field
                v-model="consigneeCreditNote.amount"
                type="number"
                density="compact"
                label="Amount *"
                @input="validateAmount"
              />
              <v-autocomplete
                v-model="consigneeCreditNote.currency_id"
                :items="currencies"
                item-value="id"
                item-title="name"
                density="compact"
                label="Currency *"
                readonly
              />
              <v-textarea v-model="consigneeCreditNote.description" density="compact" label="Comments *" />
              <div v-if="hasPayments">
                <v-alert icon="mdi-alert" color="amber" density="compact">
                  This credit note has payments, it can't be edited.
                </v-alert>
              </div>
              <div v-if="!hasPayments" class="mb-4">
                <v-alert icon="mdi-check" color="green-darken-4" density="compact">
                  This credit note has no payments, it can be edited.
                </v-alert>
              </div>
              <div v-if="!hasPayments" class="flex justify-end">
                <v-btn color="primary" @click="updateCreditNote"> Update credit note </v-btn>
              </div>
            </div>

            <v-card class="mb-4">
              <v-card-title>
                <div class="flex justify-between">
                  <div class="flex items-center gap-2">
                    <v-icon size="x-small">mdi-receipt-text-outline</v-icon>
                    <div>Payments linked</div>
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
                      <th class="w-10"></th>
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
                      v-for="(payment, index) in consigneeCreditNote.payments_all"
                      :key="`pay-${index}`"
                      :id="`payment-${payment.id}`"
                      :class="{
                        'dark:hover:bg-gray-700! hover:bg-slate-300!': true,
                        'bg-red-100! dark:bg-red-900!': payment.deleted_at,
                      }"
                    >
                      <td>
                        <TrashButton
                          :item="payment"
                          :can-restore="false"
                          @click="confirmDeleteCreditNotePayment(payment)"
                        />
                      </td>
                      <td>
                        <v-chip color="blue" text-color="white" size="small" @click="viewInvoice(payment)">
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
                          v-if="!payment.deleted_at"
                          :color="payment.chargeable?.pending_balance > 0 ? 'red' : 'green'"
                          text-color="white"
                          size="small"
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
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card>
          <v-card-title>
            <h4>Invoice related: {{ getInvoiceType }}</h4>
          </v-card-title>
          <v-card-text>
            <div>
              <p>Customer: {{ consigneeCreditNote.consignee?.name }}</p>
              <p>Linked services # {{ invoiceServices }}</p>
              <p>
                Amount: {{ getCurrencyName(invoiceRelated?.currency_id) }}
                {{ formatToCurrency(invoiceRelated.total) }}
              </p>
              <p>Date: {{ formatDateString(invoiceRelated.created_at) }}</p>
              <UserInfoBadge :item="invoiceRelated" />
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const showPayments = ref(true)
const consigneeCreditNote = ref<any>(null)

const catalogs = ref<any>({
  charges: [],
})

const hasPayments = computed(() => {
  if (!consigneeCreditNote.value.payments) return false
  return consigneeCreditNote.value.payments.length > 0
})

const invoiceRelated = computed(() => {
  if (!consigneeCreditNote.value.invoice) return {}
  return consigneeCreditNote.value.invoice
})

const invoiceServices = computed(() => {
  if (!invoiceRelated.value.invoiceable) return '-'
  // get reference_number from services
  if (invoiceRelated.value.invoiceable?.class_name.includes('Air')) {
    return invoiceRelated.value.invoiceable.services
      .map((service: any) => service.air_reference?.reference_number)
      .join(', ')
  }
  if (invoiceRelated.value.invoiceable?.class_name.includes('Sea')) {
    return invoiceRelated.value.invoiceable.services
      .map((service: any) => service.referencia?.reference_number)
      .join(', ')
  }
  return 'No services found'
})

const onlyInvoiceConcepts = computed(() => {
  if (!consigneeCreditNote.value.invoice) return []
  // filter catalogs.charges by consigneeCreditNote.invoice.invoice_charges.charge_id
  return catalogs.value.charges.filter((charge: any) =>
    consigneeCreditNote.value.invoice?.charges?.map((ic: any) => ic.charge_id).includes(charge.id)
  )
})

const validateAmount = (e: any) => {
  if (e.target.value < 0) {
    consigneeCreditNote.value.amount = 0
  }
  // can't be more than the invoice amount
  if (e.target.value > parseFloat(consigneeCreditNote.value.invoice.total)) {
    snackbar.add({ type: 'warning', text: 'Amount can not be greater than the invoice total' })
    consigneeCreditNote.value.amount = consigneeCreditNote.value.invoice.total
  }
}

const getInvoiceType = computed(() => {
  if (!invoiceRelated) return ''
  if (invoiceRelated.value.invoiceable_type?.includes('InvoiceSeaTm')) {
    return `TM Sea Invoice #${invoiceRelated.value.invoiceable_id}`
  }
  if (invoiceRelated.value.invoiceable_type?.includes('InvoiceSeaWm')) {
    return `WM Sea Invoice #${invoiceRelated.value.invoiceable_id}`
  }
  if (invoiceRelated.value.invoiceable_type?.includes('InvoiceAirTm')) {
    return `TM Air Invoice #${invoiceRelated.value.invoiceable_id}`
  }
  if (invoiceRelated.value.invoiceable_type?.includes('InvoiceAirWm')) {
    return `WM Air Invoice #${invoiceRelated.value.invoiceable_id}`
  }
  return ''
})

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

const confirmDeleteCreditNotePayment = async (creditNotePayment: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, delete',
    content: 'Please confirm this action.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.consigneeCreditNotes.deletePayment(consigneeCreditNote.value.id, creditNotePayment)
      getCustomerCreditNote()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const updateCreditNote = async () => {
  try {
    if (
      !consigneeCreditNote.value.amount ||
      !consigneeCreditNote.value.currency_id ||
      !consigneeCreditNote.value.description ||
      !consigneeCreditNote.value.charge_id
    ) {
      snackbar.add({ type: 'warning', text: 'Please fill all required fields' })
      return
    }
    loadingStore.loading = true
    const body = {
      external_folio: consigneeCreditNote.value.external_folio,
      amount: consigneeCreditNote.value.amount,
      charge_id: consigneeCreditNote.value.charge_id,
      currency_id: consigneeCreditNote.value.currency_id,
      description: consigneeCreditNote.value.description,
    }
    await $api.consigneeCreditNotes.updateNote(consigneeCreditNote.value.id, body)
    snackbar.add({ type: 'success', text: 'Credit note updated' })
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

const getCustomerCreditNote = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.consigneeCreditNotes.getCreditNoteById(props.id.toString())
    consigneeCreditNote.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getCatalogs()
await getCustomerCreditNote()
</script>
