<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="col-span-1 md:col-span-2">
        <v-card class="mb-4">
          <v-card-title>
            <div class="flex justify-between items-center gap-2">
              <div class="font-bold">
                Free format - {{ partyInvoice.type }} {{ invoiceType }} #{{ partyInvoice.invoice?.invoice_number }}
              </div>

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
                <div v-if="partyInvoice.from_deleted_invoice">
                  <v-chip size="small" color="red"
                    >Linked to deleted invoice #{{ partyInvoice.from_deleted_invoice }}</v-chip
                  >
                </div>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-[auto_1fr] gap-x-10">
              <div>Serie</div>
              <div>{{ partyInvoice.inv_serie }}</div>
              <div>Party</div>
              <div>{{ getPartyableType(partyInvoice.partyable_type) }}</div>
              <div>Party name</div>
              <div>{{ partyInvoice.partyable?.name }}</div>
              <div>RFC</div>
              <div>{{ partyInvoice.rfc }}</div>
              <div>Uso CFDI</div>
              <div>{{ partyInvoice.uso_cfdi }}</div>
              <div>Régimen Fiscal</div>
              <div>{{ partyInvoice.regimen_fiscal }}</div>
              <div>Método de pago</div>
              <div>{{ partyInvoice.metodo_pago }}</div>
              <div>Forma de pago</div>
              <div>{{ partyInvoice.forma_pago }}</div>
            </div>
            <div v-if="!isCancelled" class="flex flex-wrap justify-start gap-2 my-4">
              <PreviewPartyInvoice :invoice="partyInvoice" ref="previewPartyInvoiceRef" />
              <v-btn v-if="isProforma" size="small" color="amber" @click="editFreeFormatHeader">
                <v-icon>mdi-pencil-outline</v-icon>
                Edit proforma
              </v-btn>
              <v-btn v-if="isProforma" color="purple" size="small" @click="onConvertProformaToInvoiceClick"
                ><v-icon>mdi-invoice-arrow-right-outline</v-icon>Convert to invoice</v-btn
              >
              <v-btn v-if="isProforma" color="error" size="small" @click="onCancelClick">Cancel invoice</v-btn>

              <FreeFormatCreditNoteForm :partyInvoice="partyInvoice" @refresh="getData" />
            </div>

            <div v-if="!isCancelled && !isProforma" class="flex">
              <AuthorizeProcessSmart
                label="Cancel party invoice"
                :resource="authorizeResources.CancelFreeFormat.resource"
                :resourceId="partyInvoice.id"
              >
                <template #auth>
                  <v-btn color="error" size="small" @click="onCancelClick">Cancel invoice</v-btn>
                </template>
              </AuthorizeProcessSmart>
            </div>

            <v-alert v-if="isCancelled" density="compact" type="error" elevation="2">
              <div>This invoice has been cancelled at {{ formatDateString(partyInvoice.deleted_at) }}</div>
              <div>Reason: {{ partyInvoice.cancelled_reason }}</div>
              <div>Cancelled by: {{ partyInvoice.deletor?.name }}</div>
            </v-alert>

            <FreeFormatInvoiceHeaderEdit
              v-if="showEditHeader"
              :partyInvoice="partyInvoice"
              @cancel="showEditHeader = false"
              @refresh="closeAndRefresh"
            />
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
              <PomodoroTimer :start-date="partyInvoice.proforma_until" />
            </ClientOnly>
          </v-card-text>
        </v-card>
        <v-card v-if="partyInvoice.uuid" color="grey-lighten-4" class="mb-4">
          <v-card-title><div class="font-bold">CFDI Linked</div></v-card-title>
          <v-card-text>
            <div class="text-xs font-bold mb-4">
              CFDI UUID:
              <div>{{ partyInvoice.uuid }}</div>
            </div>
            <div class="flex flex-col space-y-4">
              <ButtonDownloadS3Object
                v-if="isFileString(partyInvoice.pdf_attachment)"
                :s3Path="partyInvoice.pdf_attachment"
              />
              <ButtonDownloadS3Object
                v-if="isFileString(partyInvoice.xml_attachment)"
                :s3Path="partyInvoice.xml_attachment"
              />
            </div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn size="x-small" color="red" @click="formCfdiDialog.showDialog">
              <v-icon>mdi-close-circle-outline</v-icon>
              Remove CFDI link
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
      <div class="col-span-1 md:col-span-3">
        <v-card color="" class="mb-4">
          <v-card-title><div class="font-bold">Concepts</div></v-card-title>
          <v-card-text>
            <v-btn v-if="!isCancelled && isProforma" color="purple" size="small" @click="onNewConceptClick"
              >Add concept</v-btn
            >
            <div v-if="formConcept.show">
              <FreeFormatInvoiceConceptForm
                :partyInvoice="partyInvoice"
                :charge="formConcept.charge"
                @cancel="formConcept.show = false"
                @refresh="closeConceptFormAndRefresh"
              />
            </div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="w-5">Actions</th>
                  <th class="font-bold! w-5">#</th>
                  <th class="font-bold!">Concept</th>
                  <th class="font-bold!">Notes</th>
                  <th class="font-bold!">Amount</th>
                  <th class="font-bold!">IVA</th>
                  <th class="font-bold! text-right">Subtotal</th>
                  <th class="text-left">Pending</th>
                  <th class="font-bold!">Status</th>
                  <th class="font-bold!">Payment(s)</th>
                  <th class="font-bold!">Created by</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in invoiceCharges" :key="`invoice-charge-${idx}`">
                  <td>
                    <div class="flex gap-2">
                      <EditButton :item="charge" @click="editConcept(charge)" />
                      <TrashButton :item="charge" @click="deleteConceptConfirm(charge)" />
                    </div>
                  </td>
                  <td>{{ charge.id }}</td>
                  <td>
                    <InvoiceChargeCfdiName :invoiceCharge="charge" :names="chargeCfdiNames" />
                  </td>
                  <td>
                    {{ charge.notes }}
                  </td>
                  <td class="whitespace-nowrap text-right">
                    {{ getCurrencyName(charge.currency_id) }} {{ formatToCurrency(charge.amount) }}
                  </td>
                  <td class="whitespace-nowrap text-right">{{ formatToCurrency(charge.amount_iva) }}</td>
                  <td class="whitespace-nowrap text-right">{{ formatToCurrency(getConceptTotal(charge)) }}</td>
                  <td class="whitespace-nowrap text-right">{{ formatToCurrency(charge.pending_balance) }}</td>
                  <td>
                    <v-chip
                      :color="charge.pending_balance > 0 ? 'red' : 'green'"
                      text-color="white"
                      size="small"
                      class="capitalize"
                    >
                      {{ charge.pending_balance > 0 ? 'Pending' : 'Paid' }}
                    </v-chip>
                  </td>
                  <td>
                    <div v-for="(payment, index) in charge.payments" :key="`payment-${index}`" class="mb-1">
                      <v-chip color="blue" text-color="white" small @click="viewPayment(payment)"
                        ><v-icon>mdi-eye-outline</v-icon>{{ paymentableName(payment) }} #{{ payment.paymentable_id }}
                        {{ formatToCurrency(payment.amount) }}</v-chip
                      >
                    </div>
                  </td>
                  <td class="whitespace-nowrap">
                    <UserInfoBadge :item="charge">
                      {{ charge.creator?.name }}
                    </UserInfoBadge>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="text-right font-bold">Total</td>
                  <td class="font-bold text-right">{{ formatToCurrency(partyInvoiceTotal) }}</td>
                  <td colspan="4"></td>
                </tr>
              </tfoot>
            </v-table>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <v-card color="" class="mb-4">
      <v-card-title><div class="font-bold">Credit Notes</div></v-card-title>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="w-5">Actions</th>
              <th class="font-bold! w-10">#</th>
              <th class="font-bold! text-right">Subtotal</th>
              <th class="font-bold! text-right">IVA</th>
              <th class="font-bold! text-right">Total</th>
              <th class="font-bold! w-32">Created by</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(partyCreditNote, idx) in partyInvoice.party_credit_notes" :key="`free-format-cn-${idx}`">
              <td>
                <div v-if="false" class="flex gap-2">
                  <EditButton :item="partyCreditNote" @click="editConcept(partyCreditNote)" />
                  <TrashButton :item="partyCreditNote" @click="deleteConceptConfirm(partyCreditNote)" />
                </div>
              </td>
              <td>#{{ partyCreditNote.id }}</td>
              <td class="whitespace-nowrap text-right">
                {{ getCurrencyName(partyCreditNote.currency_id) }}
                {{
                  formatToCurrency(
                    partyCreditNote.charges.reduce((acc: any, charge: any) => acc + parseFloat(charge.amount), 0)
                  )
                }}
              </td>
              <td class="whitespace-nowrap text-right">
                {{
                  formatToCurrency(
                    partyCreditNote.charges.reduce((acc: any, charge: any) => acc + parseFloat(charge.amount_iva), 0)
                  )
                }}
              </td>
              <td class="whitespace-nowrap text-right">
                {{ formatToCurrency(getPartyCreditNoteTotal(partyCreditNote)) }}
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="partyCreditNote">
                  {{ formatDateString(partyCreditNote.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="showCancelDialog" max-width="400">
      <v-card>
        <v-card-title>Cancel invoice #{{ partyInvoice.invoice?.id }}</v-card-title>
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

    <v-dialog v-model="deleteInvoice.show.value" max-width="400">
      <v-card>
        <v-card-title>Cancel invoice #{{ partyInvoice.id }}</v-card-title>
        <v-card-text>
          <div>Please confirm this action.</div>
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn @click="deleteInvoice.hideDialog">No, go back</v-btn>
            <v-btn color="error" @click="deleteInvoice.confirmDelete">Yes, cancel</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteConcept.show" max-width="400">
      <v-card>
        <v-card-title>Remove concept {{ deleteConcept.concept?.name }}</v-card-title>
        <v-card-text>
          <div>Please confirm this action.</div>
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn @click="cancelDeleteConcept">No, go back</v-btn>
            <v-btn color="error" @click="confirmDeleteConcept">Yes, remove concept</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="proformaToInvoice.show.value" max-width="400">
      <v-card>
        <v-card-title>Convert proforma #{{ partyInvoice.id }} to invoice</v-card-title>
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

    <v-dialog v-model="formCfdiDialog.show.value" max-width="400">
      <v-card>
        <v-card-title>Please confirm this action</v-card-title>
        <v-card-text>
          <div>Are you sure you want to remove the CFDI linked?</div>
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn size="small" color="gray" @click="formCfdiDialog.hideDialog">No, go back</v-btn>
            <v-btn size="small" color="red" @click="formCfdiDialog.confirmAction">Yes, remove it</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { paymentableName } from '~/utils/data/morphNames'
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

const previewPartyInvoiceRef = ref<any>(null)
const showEditHeader = ref(false)

const formConcept = ref<any>({
  show: false,
  charge: null,
})

const deleteConcept = ref<any>({
  show: false,
  concept: null,
})

const onNewConceptClick = () => {
  formConcept.value.charge = null
  formConcept.value.show = true
}

const editConcept = (charge: any) => {
  formConcept.value.charge = charge
  formConcept.value.show = true
}

const cancelDeleteConcept = () => {
  deleteConcept.value.show = false
}

const deleteConceptConfirm = (charge: any) => {
  deleteConcept.value.concept = charge
  deleteConcept.value.show = true
}

const useFormCfdiDialog = () => {
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
      await $api.freeFormatInvoices.deleteCfdiLink(props.id)
      snackbar.add({ type: 'success', text: 'CFDI link removed' })
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

const formCfdiDialog = useFormCfdiDialog()

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
        invoice_service_class_name: partyInvoice.value?.class_name,
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
const deleteInvoice = useDeleteProforma()

const cancel = ref<any>({
  reason: '',
})

const partyInvoice = ref<any>({})
const chargeCfdiNames = ref<any>([])
const showCancelDialog = ref(false)

const isFileString = (file: any) => {
  if (!file) return false
  // check if is a string
  return typeof file === 'string'
}

const getPartyableType = (partyableType: string) => {
  if (partyableType === 'App\\Models\\Mexico\\Consignee') {
    return 'Customer'
  }
  if (partyableType === 'App\\Models\\Mexico\\Supplier') {
    return 'Supplier'
  }
  if (partyableType === 'App\\Models\\Mexico\\Line') {
    return 'Freight line'
  }
  if (partyableType === 'App\\Models\\Mexico\\CustomAgent') {
    return 'Custom agent'
  }
  return partyableType
}

const invoiceType = computed(() => {
  return partyInvoice.value?.is_proforma === 1 ? 'Proforma' : 'Invoice'
})

const isCancelled = computed(() => {
  return partyInvoice.value?.deleted_at != null
})

const isProforma = computed(() => {
  return partyInvoice.value?.is_proforma === 1
})

const isPaid = computed(() => {
  if (!partyInvoice.value?.invoice) {
    return false
  }
  return partyInvoice.value?.invoice.is_paid === 1
})

const invoiceCharges = computed(() => {
  if (isCancelled.value) {
    return partyInvoice.value?.invoice?.charges_cancelled
  }
  return partyInvoice.value?.invoice?.charges
})

const expirationDate = computed(() => {
  return formatDateString(partyInvoice.value?.proforma_until)
})

const getConceptTotal = (concept: any) => {
  return parseFloat(concept.amount) + parseFloat(concept.amount_iva)
}

const partyInvoiceTotal = computed(() => {
  if (!invoiceCharges.value) {
    return 0
  }
  return invoiceCharges.value?.reduce((acc: number, concept: any) => {
    return acc + parseFloat(concept.amount) + parseFloat(concept.amount_iva)
  }, 0)
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
        invoice_type: partyInvoice.value?.inv_type,
        service: 'free_format',
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

const onConvertProformaToInvoiceClick = () => {
  proformaToInvoice.showDialog()
}

const editFreeFormatHeader = () => {
  showEditHeader.value = !showEditHeader.value
}

const closeAndRefresh = async () => {
  showEditHeader.value = false
  await getData()
}

const closeConceptFormAndRefresh = async () => {
  formConcept.value.show = false
  formConcept.value.charge = null
  await getData()
}

const getPartyCreditNoteTotal = (creditNote: any) => {
  return creditNote.charges.reduce(
    (acc: any, charge: any) => acc + parseFloat(charge.amount) + parseFloat(charge.amount_iva),
    0
  )
}

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.freeFormatInvoices.getById(props.id)) as any

    partyInvoice.value = response
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

const onCancelClick = async () => {
  showCancelDialog.value = !showCancelDialog.value
}

const confirmDeleteConcept = async () => {
  try {
    loadingStore.start()
    const body = {
      invoice_charge_id: deleteConcept.value.concept.id,
    }
    await $api.freeFormatInvoices.deleteProformaConcept(props.id, body)
    snackbar.add({ type: 'success', text: 'Concept removed' })
    deleteConcept.value.show = false
    deleteConcept.value.concept = null
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const cancelInvoice = async () => {
  try {
    if (!cancel.value.reason) {
      snackbar.add({ type: 'error', text: 'Please provide a reason for the cancellation' })
      return
    }
    loadingStore.start()
    const response = (await $api.freeFormatInvoices.cancelPartyInvoice(props.id, cancel.value)) as any

    snackbar.add({ type: 'success', text: 'Party invoice canceled' })
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

const getPaymentTypeName = (payment: any) => {
  return paymentableName(payment)
}

const viewPayment = (payment: any) => {
  console.log('payment', payment)
  if (payment.paymentable_type.includes('BankMovement')) {
    router.push(`/transfers/global/view-${payment.paymentable_id}?focusPayable=${payment.id}`)
    return
  }
  console.error('Unknown payment type')
}

onMounted(async () => {
  await getData()
  await getChargeCfdiNames()
  // if query params preview is true, show the preview dialog
  if (router.currentRoute.value.query.preview === 'true') {
    if (previewPartyInvoiceRef.value) {
      previewPartyInvoiceRef.value.previewInvoice()
    }
  }
})
</script>
