<template>
  <div>
    <v-alert v-if="!hasAmountAvailable" type="info" variant="tonal"> No amount available to apply payment. </v-alert>
    <v-btn v-if="hasAmountAvailable" color="primary" size="small" @click="showDialog"> Apply Payment </v-btn>

    <v-dialog v-model="formDialog.show" persistent>
      <v-card>
        <v-card-title> Search Line Invoice to Pay </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-3 gap-2 mb-2">
            <div>
              <h1 class="text-xl font-bold text-gray-800">Pay same line invoices using</h1>
              <div class="max-w-xs mx-auto bg-white rounded-lg shadow-md overflow-hidden mt-2">
                <div class="bg-gray-100 px-4 py-2">
                  <h2 class="text-lg font-medium text-gray-800">Credit Note #{{ lineCreditNote.id }}</h2>
                </div>
                <div class="px-4 py-5 sm:p-6">
                  <div class="flex flex-col items-start justify-between mb-2">
                    <span class="text-sm font-medium text-gray-600">Line</span>
                    <span class="text-lg font-medium text-gray-800">{{ lineCreditNote.line?.name }}</span>
                  </div>
                  <div class="flex flex-row items-center justify-between mb-4">
                    <div class="flex flex-col items-start">
                      <span class="text-sm font-medium text-gray-600">Created at</span>
                      <span class="text-lg font-medium text-gray-800">{{
                        formatDateOnlyString(lineCreditNote.created_at)
                      }}</span>
                    </div>
                  </div>
                  <div class="flex flex-row items-center justify-between">
                    <div class="flex flex-col items-start">
                      <span class="text-sm font-medium text-gray-600">Amount</span>
                      <span class="text-lg font-medium text-gray-800">{{
                        formatToCurrency(lineCreditNote.amount)
                      }}</span>
                    </div>
                    <div class="flex flex-col items-start">
                      <span class="text-sm font-medium text-gray-600">Available Balance</span>
                      <span class="text-lg font-bold text-gray-800">{{
                        formatToCurrency(lineCreditNote.amount_available)
                      }}</span>
                    </div>
                  </div>
                  <div class="flex flex-col items-center justify-end bg-slate-100">
                    <span class="text-sm font-medium text-gray-600">Used</span>
                    <span class="text-lg font-medium text-gray-800">{{
                      formatToCurrency(lineCreditNote.amount - lineCreditNote.amount_available)
                    }}</span>
                  </div>
                  <div class="flex flex-col items-center justify-end bg-slate-200">
                    <span class="text-sm font-medium text-gray-600">Amount to Pay</span>
                    <span class="text-lg font-medium text-gray-800">{{ formatToCurrency(amountToPayTotal) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-2">
              <v-text-field
                v-model="filters.search"
                density="compact"
                placeholder="Search a line invoice by number"
                hide-details
              />
              <v-btn color="purple" size="small" @click="searchInvoices">Search</v-btn>
              <div v-if="lineInvoiceToPay">
                <v-card flat>
                  <v-card-text>
                    <v-table density="compact" fixed-header striped>
                      <thead>
                        <tr>
                          <th class="font-bold!">Invoice #</th>
                          <th class="font-bold!">Charge</th>
                          <th class="font-bold!">Amount</th>
                          <th class="font-bold!">Pending balance</th>
                          <th class="font-bold!">Pay amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template
                          v-for="(lineInvoiceRef, index) in lineInvoiceToPay.refs"
                          :key="`line-inv-ref-${index}`"
                        >
                          <tr
                            v-for="(charge, index2) in lineInvoiceRef.invoice.charges"
                            :key="`line-inv-ref-invoice-charge-${index}-${index2}`"
                          >
                            <td>
                              {{ getInvoiceableName(lineInvoiceRef.invoice) }} #{{
                                lineInvoiceRef.invoice.invoiceable_id
                              }}
                            </td>
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
                        </template>
                      </tbody>
                    </v-table>
                    <v-btn color="primary" :loading="loadingStore.loading" @click="payInvoices"
                      >Set payment to invoice(s) {{ formatToCurrency(amountToPayTotal) }}</v-btn
                    >
                  </v-card-text>
                </v-card>
              </div>
              <v-alert v-if="!lineInvoiceToPay" type="warning" variant="tonal" density="compact">
                No line invoice found.
              </v-alert>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="flex justify-start gap-2">
          <v-btn color="red" variant="tonal" @click="closeDialog"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  lineCreditNote: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['refresh'])

const formDialog = ref<any>({
  show: false,
})

const filters = ref<any>({
  search: null,
})
const lineInvoiceToPay = ref<any>(null)

const showDialog = () => {
  formDialog.value.show = true
}

const closeDialog = () => {
  formDialog.value.show = false
}

const hasAmountAvailable = computed(() => {
  return props.lineCreditNote.amount_available > 0
})

const lineInvoiceRefs = computed(() => {
  return lineInvoiceToPay.value?.refs || []
})

const checkMaxAmountToPay = (value: any, charge: any) => {
  if (value > charge.pending_balance) {
    charge.amount_to_pay = charge.pending_balance
  }
}

const amountToPayTotal = computed(() => {
  let total = 0
  lineInvoiceRefs.value.forEach((lineInvoiceRef: any) => {
    lineInvoiceRef.invoice.charges.forEach((charge: any) => {
      let amountToPay = parseFloat(charge.amount_to_pay)
      if (isNaN(amountToPay)) amountToPay = 0
      total += amountToPay
    })
  })
  return total
})

const searchInvoices = async () => {
  try {
    if (!filters.value.search) {
      snackbar.add({ type: 'warning', text: 'Please enter a search term' })
      return
    }
    lineInvoiceToPay.value = null
    loadingStore.start()
    const body = {
      search: filters.value.search,
    }
    const result = await $api.lineCreditNotes.searchLineInvoicesToPay(props.lineCreditNote.id, body)
    snackbar.add({ type: 'success', text: 'Search completed' })
    lineInvoiceToPay.value = result
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const payInvoices = async () => {
  try {
    loadingStore.start()
    const chargesToPay = [] as any
    lineInvoiceRefs.value.forEach((lineInvoiceRef: any) => {
      lineInvoiceRef.invoice.charges.forEach((charge: any) => {
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
    await $api.lineCreditNotes.payLineInvoices(props.lineCreditNote.id, body)

    snackbar.add({ type: 'success', text: 'Invoices paid successfully' })
    // clear all
    lineInvoiceToPay.value = null
    filters.value = {
      search: null,
    }
    emits('refresh')
    closeDialog()
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
