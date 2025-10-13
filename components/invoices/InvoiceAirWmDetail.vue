<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-48">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="font-bold">Customer WM {{ invoiceType }} #{{ invoiceWm.invoice.invoice_number }}</div>
            <div class="flex gap-4 items-center">
              <v-chip
                :color="isPaid ? 'green' : 'warning'"
                text-color="white"
                size="small"
                class="capitalize"
                v-if="!isCancelled"
              >
                {{ isPaid ? 'Paid' : 'Payment pending' }}
              </v-chip>
              <div v-if="invoiceWm.from_deleted_invoice">
                <v-chip size="small" color="red"
                  >Linked to deleted invoice #{{ invoiceWm.from_deleted_invoice }}</v-chip
                >
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2">
              <div>Customer</div>
              <div>{{ invoiceWm.consignee?.name }}</div>
              <div>RFC</div>
              <div>{{ invoiceWm.rfc }}</div>
              <div>Address</div>
              <div>{{ invoiceWm.address }}</div>

              <div class="col-span-2 py-1">
                <v-divider></v-divider>
              </div>
              <div>Amount</div>
              <div>
                {{ getCurrencyName(invoiceWm.invoice?.currency_id) }} {{ formatToCurrency(invoiceWm.invoice?.total) }}
              </div>
              <div v-if="invoiceWm.invoice?.currency_id != 2">USD Exchange rate</div>
              <div v-if="invoiceWm.invoice?.currency_id != 2">
                {{ formatToCurrency(1 / invoiceWm.exchange_rate) }}
              </div>
              <div class="col-span-2 py-1">
                <v-divider></v-divider>
              </div>
            </div>
            <div class="flex justify-around gap-2 mb-2">
              <PreviewWmInvoice service="air" :invoice="invoiceWm" />
              <div v-if="!isCancelled" class="flex flex-col gap-2">
                <v-btn v-if="isProforma" color="warning" size="small" @click="onEditProformaClick"
                  ><v-icon>mdi-pencil-outline</v-icon>Edit proforma</v-btn
                >

                <v-btn v-if="isProforma" color="red" size="small" @click="onDeleteProformaClick"
                  ><v-icon>mdi-delete-outline</v-icon>Delete proforma</v-btn
                >

                <v-btn v-if="isProforma" color="purple" size="small" @click="onConvertProformaToInvoiceClick"
                  ><v-icon>mdi-invoice-arrow-right-outline</v-icon>Convert to invoice</v-btn
                >
              </div>

              <AuthorizeProcessSmart
                v-if="!isCancelled && !isProforma"
                label="Cancel WM invoice"
                :resource="authorizeResources.CancelInvoiceWmAir.resource"
                :resourceId="invoiceWm.id"
              >
                <template #auth>
                  <v-btn color="error" size="small" @click="onCancelClick">Cancel invoice</v-btn>
                </template>
              </AuthorizeProcessSmart>
            </div>
            <v-alert v-if="isCancelled" density="compact" type="error" elevation="2">
              <div>This invoice has been cancelled at {{ formatDateString(invoiceWm.cancelled_at) }}</div>
              <div>Reason: {{ invoiceWm.cancelled_reason }}</div>
              <div>Cancelled by: {{ invoiceWm.cancel_by?.name }}</div>
            </v-alert>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card v-if="isProforma && !isCancelled" density="compact" class="mb-2">
          <v-card-title
            ><div class="text-base">Updates available until: {{ expirationDate }}</div>
          </v-card-title>
          <v-card-text>
            <ClientOnly>
              <PomodoroTimer :start-date="invoiceWm.proforma_until" />
            </ClientOnly>
          </v-card-text>
        </v-card>

        <v-card color="" class="mb-4">
          <v-card-title><div class="font-bold">Linked services</div></v-card-title>
          <v-card-text>
            <div class="flex gap-2">
              <v-btn
                v-for="(service, index) in invoiceWm.services_all"
                :key="`linked-ref-${index}`"
                color="primary"
                size="small"
                variant="tonal"
                :to="`/air/${service.air_reference.impoExpo == 'I' ? 'import' : 'export'}/view-details-${
                  service.air_reference?.id
                }`"
              >
                <div class="flex items-center gap-2">
                  <v-icon>mdi-open-in-new</v-icon>
                  <span>Service #{{ service.air_reference?.reference_number }} details</span>
                  <v-icon :color="service.deleted_at ? 'red' : 'green'">{{
                    service.deleted_at ? 'mdi-delete-variant' : 'mdi-plus'
                  }}</v-icon>
                </div>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
        <SendCustomerInvoiceByEmail :id="$props.id" :invoice="invoiceWm" invoice_type="wm" />
      </div>
      <div class="col-span-2">
        <v-card v-if="isProforma" color="blue-lighten-4" class="mb-4">
          <v-card-title
            ><div class="font-bold">{{ invoiceType }} detail</div></v-card-title
          >
          <v-card-text>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-bold! w-5">#</th>
                  <th class="font-bold!">Ref #</th>
                  <th class="font-bold!">Concept</th>
                  <th class="font-bold!">Amount</th>
                  <th class="font-bold! text-right">Total</th>
                  <th class="font-bold!">Generated by</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in invoiceCharges" :key="`invoice-charge-${idx}`">
                  <td>{{ charge.id }}</td>
                  <td>{{ getReferenceNumber(charge.chargeable?.air_reference_id) }}</td>
                  <InvoiceChargeCfdiName :invoiceCharge="charge" :names="chargeCfdiNames" />
                  <td>{{ getCurrencyName(charge.currency_id) }} {{ formatToCurrency(charge.amount) }}</td>
                  <td class="text-right">{{ formatToCurrency(getWmConceptTotal(charge)) }}</td>
                  <td>{{ charge.creator?.name }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right font-bold">Total</td>
                  <td class="font-bold text-right">{{ formatToCurrency(invoiceWmTotal) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </v-table>
          </v-card-text>
        </v-card>

        <v-card v-if="!isProforma" color="grey-lighten-4" class="mb-4">
          <v-card-title
            ><div class="font-bold">{{ invoiceType }} detail</div></v-card-title
          >
          <v-card-text>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-bold! w-5">#</th>
                  <th class="font-bold!">Service</th>
                  <th class="font-bold!">Concept</th>
                  <th class="font-bold!">Amount</th>
                  <th class="font-bold! text-right">Subtotal</th>
                  <th class="text-left">Pending</th>
                  <th class="font-bold!">Status</th>
                  <th class="font-bold!">Payment(s)</th>
                  <th class="font-bold!">Generated by</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in invoiceCharges" :key="`invoice-charge-${idx}`">
                  <td>{{ charge.id }}</td>
                  <td>{{ charge.serviceable?.reference_number }}</td>
                  <InvoiceChargeCfdiName :invoiceCharge="charge" :names="chargeCfdiNames" />
                  <td class="text-right">{{ formatToCurrency(charge.amount) }}</td>
                  <td class="text-right">{{ formatToCurrency(getWmConceptTotal(charge)) }}</td>
                  <td class="text-right">{{ formatToCurrency(charge.pending_balance) }}</td>
                  <td>
                    <v-chip
                      :color="charge.pending_balance > 0 ? 'red' : 'green'"
                      text-color="white"
                      small
                      class="capitalize"
                    >
                      {{ charge.pending_balance > 0 ? 'Pending' : 'Paid' }}
                    </v-chip>
                  </td>
                  <td>
                    <div v-for="(payment, index) in charge.payments" :key="`bank-movement-${index}`">
                      <v-chip color="blue" text-color="white" small @click="viewPayment(payment)"
                        ><v-icon>mdi-eye-outline</v-icon>Payment #{{ payment.id }}
                        {{ formatToCurrency(payment.amount) }}</v-chip
                      >
                    </div>
                  </td>
                  <td>{{ charge.creator?.name }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right font-bold">Total</td>
                  <td class="font-bold text-right">{{ formatToCurrency(invoiceWmTotal) }}</td>
                  <td colspan="3"></td>
                </tr>
              </tfoot>
            </v-table>
          </v-card-text>
        </v-card>
      </div>
    </div>
    <v-dialog v-model="showCancelDialog" max-width="400">
      <v-card>
        <v-card-title>Cancel invoice #{{ invoiceWm.invoice.invoice_number }}</v-card-title>
        <v-card-text>
          <div>Are you sure you want to cancel this invoice?</div>
          <div>
            <v-textarea
              v-model="cancel.reason"
              label="Reason"
              hint="Please provide a reason for the cancellation"
              counter
              rows="3"
              clearable
            ></v-textarea>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn @click="showCancelDialog = !showCancelDialog">No, go back</v-btn>
            <v-btn color="error" @click="cancelInvoice">Yes, cancel</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteProforma.show.value" max-width="400">
      <v-card>
        <v-card-title>Cancel proforma #{{ invoiceWm.invoice.invoice_number }}</v-card-title>
        <v-card-text>
          <div>Canceling the proforma will release the charges to generate another proforma.</div>
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn @click="deleteProforma.hideDialog">No, go back</v-btn>
            <v-btn color="error" @click="deleteProforma.confirmDelete">Yes, cancel</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="proformaToInvoice.show.value" max-width="400">
      <v-card>
        <v-card-title>Convert proforma #{{ invoiceWm.invoice.invoice_number }} to invoice</v-card-title>
        <v-card-text>
          <div>Are you sure you want to convert this proforma to an invoice?</div>
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn @click="proformaToInvoice.hideDialog">No, go back</v-btn>
            <v-btn color="success" @click="proformaToInvoice.confirmAction">Yes, convert</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { authorizeResources } from '~/utils/data/system'
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

const useProformaToInvoice = () => {
  const show = ref(false)

  const showDialog = () => {
    show.value = true
  }

  const hideDialog = () => {
    show.value = false
  }

  const confirmAction = async () => {
    try {
      loadingStore.start()
      const body = {
        invoice_type: 'wm',
        service: 'air',
        invoice_id: parseInt(props.id),
      }
      await $api.invoices.convertProformaToInvoice(body)

      snackbar.add({ type: 'success', text: 'Proforma converted to invoice' })
      await getData()
      show.value = false
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }

  return {
    show,
    showDialog,
    hideDialog,
    confirmAction,
  }
}

const proformaToInvoice = useProformaToInvoice()

const useDeleteProforma = () => {
  const show = ref(false)

  const showDialog = () => {
    show.value = true
  }

  const hideDialog = () => {
    show.value = false
  }

  const confirmDelete = async () => {
    try {
      loadingStore.start()
      const body = {
        invoice_id: props.id,
        invoice_service_class_name: invoiceWm.value?.class_name,
      }
      await $api.invoices.deleteConsigneeProforma(body)

      snackbar.add({ type: 'success', text: 'Proforma deleted' })
      await getData()
      show.value = false
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }

  return {
    show,
    showDialog,
    hideDialog,
    confirmDelete,
  }
}

const deleteProforma = useDeleteProforma()

const cancel = ref<any>({
  reason: '',
})

const invoiceWm = ref<any>({})
const chargeCfdiNames = ref<any>([])
const showCancelDialog = ref(false)

const getReferenceNumber = (referenciaId: number) => {
  return (invoiceWm.value?.services || []).find((service: any) => service.air_reference_id === referenciaId)
    .air_reference?.reference_number
}

const invoiceType = computed(() => {
  return invoiceWm.value?.is_proforma === 1 ? 'Proforma' : 'Invoice'
})

const isProforma = computed(() => {
  return invoiceWm.value?.is_proforma === 1
})

const isCancelled = computed(() => {
  return invoiceWm.value?.deleted_at != null
})

const isPaid = computed(() => {
  if (!invoiceWm.value?.invoice) {
    return false
  }
  return invoiceWm.value?.invoice.is_paid === 1
})

const invoiceCharges = computed(() => {
  if (isCancelled.value) {
    return invoiceWm.value?.invoice?.charges_cancelled
  }
  return invoiceWm.value?.invoice?.charges
})

const expirationDate = computed(() => {
  return formatDateString(invoiceWm.value?.proforma_until)
})

const getWmConceptTotal = (concept: any) => {
  return parseFloat(concept.amount) + parseFloat(concept.amount_iva)
}

const invoiceWmTotal = computed(() => {
  if (!invoiceCharges.value) {
    return 0
  }
  return invoiceCharges.value?.reduce((acc: number, concept: any) => {
    return acc + parseFloat(concept.amount) + parseFloat(concept.amount_iva)
  }, 0)
})

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.wmAirInvoices.getById(props.id)) as any

    invoiceWm.value = response
  } catch (e) {
    console.error(e)
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

await getData()
await getChargeCfdiNames()

const onCancelClick = async () => {
  showCancelDialog.value = !showCancelDialog.value
}

const onEditProformaClick = async () => {
  router.push(`/invoices/search/wmair-${props.id}-edit-proforma`)
}

const onDeleteProformaClick = () => {
  deleteProforma.showDialog()
}

const onConvertProformaToInvoiceClick = () => {
  proformaToInvoice.showDialog()
}

const cancelInvoice = async () => {
  try {
    if (!cancel.value.reason) {
      snackbar.add({ type: 'error', text: 'Please provide a reason for the cancellation' })

      return
    }
    loadingStore.start()
    await $api.wmAirInvoices.cancel(props.id, cancel.value)

    snackbar.add({ type: 'success', text: 'Invoice canceled' })
    await getData()
    showCancelDialog.value = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const viewPayment = (payment: any) => {
  if (payment.paymentable_type.includes('BankMovement')) {
    router.push(`/transfers/global/view-${payment.paymentable_id}?focusPayable=${payment.id}`)
    return
  }
  console.error('Unknown payment type')
}
</script>
