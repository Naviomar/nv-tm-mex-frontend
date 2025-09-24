<template>
  <div>
    <v-card>
      <v-card-title>Request pay line detention #{{ props.id }}</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <v-card>
            <v-card-title>
              <div class="flex justify-between gap-2">
                <div>Details</div>
                <div>
                  <div v-if="isCancelled">
                    <v-chip color="red" size="small" variant="outlined"> Canceled </v-chip>
                  </div>
                  <div v-if="!isCancelled">
                    <div v-if="!reqDetention.invoice">
                      <v-chip color="warning" size="small" variant="outlined"> Pending invoice </v-chip>
                    </div>
                    <div v-if="reqDetention.invoice">
                      <v-chip :color="reqDetention.invoice?.is_paid ? 'success' : 'warning'" size="small">
                        {{ reqDetention.invoice?.is_paid ? 'Paid' : 'Pending payment' }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-title>
            <v-card-text>
              <div class="grid grid-cols-2 gap-1">
                <div>Freight line</div>
                <div>{{ reqDetention.line?.name }}</div>
                <div>Invoice type:</div>
                <div>{{ reqDetention.inv_type }}</div>
                <div>Request Amount</div>
                <div class="font-bold">{{ formatToCurrency(reqDetentionAmount) }}</div>
                <div>Debit Linked:</div>
                <div>{{ formatToCurrency(reqDetentionAmountDebit) }}</div>
                <div>Credit Linked:</div>
                <div class="text-red-500">-{{ formatToCurrency(reqDetentionAmountCredit) }}</div>
                <div>Total To Pay</div>
                <div class="font-bold">
                  {{ formatToCurrency(reqDetentionAmountTotal) }}
                </div>

                <div>Requested by:</div>
                <div>{{ reqDetention.creator?.name }}</div>
                <div>Created at:</div>
                <div>{{ formatDateString(reqDetention.created_at) }}</div>
              </div>

              <div v-if="!totalRequestedMatch">
                <v-alert type="error" density="compact" variant="outlined">
                  Requested amount does not match with linked invoices. Please review to continue with notification to
                  generate invoice available to pay.
                </v-alert>
              </div>

              <div v-if="totalRequestedMatch">
                <v-alert type="success" density="compact" variant="outlined">
                  Requested amount match with linked invoices. Ready to send notification to pay.
                </v-alert>
              </div>

              <div v-if="!isCancelled" class="flex flex-wrap gap-2 py-2">
                <v-btn v-if="!isPaid" color="red" size="small" @click="showConfirmCancelReq"
                  >Cancel detention request</v-btn
                >

                <v-btn color="lime-darken-2" size="small" @click="previewReqPdf">View PDF</v-btn>

                <div v-if="!isCancelled" class="flex justify-start gap-2">
                  <ReqDetentionAttachments :req-detention="reqDetention" />
                  <v-btn color="orange-darken-2" size="small" @click="showSendNotyPay">Send notification to pay</v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <div>
            <v-card class="mb-4">
              <v-card-title>
                <div class="flex items-center gap-2">
                  <div>Origin Bank</div>
                </div>
              </v-card-title>
              <v-card-text>
                <div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">System Bank:</div>
                    <div class="col-span-2">{{ reqDetention.origin_bank_name }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">Account number:</div>
                    <div class="col-span-2">{{ reqDetention.origin_account_number }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
            <v-card>
              <v-card-title>
                <div class="flex items-center gap-2">
                  <div v-if="!isPaid && !isCancelled">
                    <v-btn color="primary" variant="outlined" size="small" @click="showEditBankInfo"
                      ><v-icon class="cursor-pointer">
                        {{ formEditBank.show ? 'mdi-close' : 'mdi-pencil-outline' }}
                      </v-icon></v-btn
                    >
                  </div>
                  <div>Beneficiary Bank</div>
                </div>
              </v-card-title>
              <v-card-text>
                <div v-if="formEditBank.show">
                  <VeeForm
                    @submit="onSaveBankInfoClick"
                    :validation-schema="schemaBankInfo"
                    :init-values="reqDetention"
                    ref="refundBankInfoRef"
                  >
                    <div class="font-bold mb-4">Update bank information for this refund</div>
                    <InputText name="bank" label="Bank" density="compact" />
                    <InputText name="beneficiary_name" label="Beneficiary name" density="compact" />
                    <InputText name="account_number" label="Account number" density="compact" type="number" />
                    <InputText name="clabe" density="compact" label="CLABE" type="number" />
                    <InputText name="aba" label="ABA" density="compact" type="number" />
                    <InputText name="swift" label="Swift" density="compact" type="text" />
                    <InputText name="iban" label="IBAN" density="compact" type="number" />
                    <div class="flex justify-end gap-2">
                      <v-btn color="primary" @click="closeEditBankInfo">Cancel</v-btn>
                      <v-btn type="submit" color="success">Save</v-btn>
                    </div>
                  </VeeForm>
                </div>
                <div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">Bank:</div>
                    <div class="col-span-2">{{ reqDetention.bank }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">Beneficary name:</div>
                    <div class="col-span-2">{{ reqDetention.beneficiary_name }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">Account number:</div>
                    <div class="col-span-2">{{ reqDetention.account_number }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">CLABE:</div>
                    <div class="col-span-2">{{ reqDetention.clabe }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">ABA:</div>
                    <div class="col-span-2">{{ reqDetention.aba }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">Swift:</div>
                    <div class="col-span-2">{{ reqDetention.swift }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">IBAN:</div>
                    <div class="col-span-2">{{ reqDetention.iban }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 mb-4">
          <div class="text-base font-bold">Container - Detentions</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="w-10">Actions</th>
                <th>Service Ref#</th>
                <th>Container</th>
                <th>Detention pay line</th>
                <th v-if="isTm">IVA</th>
                <th>Currency</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reqDetention.containers?.length === 0">
                <td colspan="6" class="text-center">No containers in request.</td>
              </tr>
              <tr v-for="(demContainer, index) in reqDetention.containers" :key="`req-detention-cont-${index}`">
                <td>
                  <div v-if="!isPaid && !isCancelled && !hasInvoice">
                    <TrashButton :item="demContainer" @click="showConfirmDelete" />
                  </div>
                </td>
                <td>{{ demContainer.referencia?.reference_number }}</td>
                <td>{{ demContainer.reference_container?.container_number }}</td>
                <td>
                  <span v-if="isTm">
                    {{ formatToCurrency(demContainer.amount) }}
                  </span>
                  <span v-if="!isTm">
                    {{ formatToCurrency(parseFloat(demContainer.amount) + parseFloat(demContainer.amount_iva)) }}
                  </span>
                </td>
                <td v-if="isTm">{{ formatToCurrency(demContainer.amount_iva) }}</td>
                <td>{{ getCurrencyName(demContainer.currency_id) }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="flex justify-between gap-2">
            <div class="text-base font-bold">Supplier Invoices Linked</div>
            <v-btn v-if="!isPaid && !isCancelled && !hasInvoice" color="primary" size="small" @click="addNewInvoice"
              >Link new supplier invoice</v-btn
            >
          </div>

          <div v-if="invoiceForm.show">
            <v-card>
              <v-card-title>Link new supplier invoice</v-card-title>
              <v-card-text>
                <div class="grid grid-cols-[1fr_1fr_auto] items-start gap-4">
                  <AGlobalSearch
                    :onSearch="searchSuppliers"
                    v-model="invoiceForm.supplier_id"
                    validate-key="supplier_id"
                    label="Supplier"
                    hide-details
                  />
                  <v-text-field v-model="invoiceForm.folio" label="Folio" density="compact" hide-details />
                  <v-btn color="success" @click="onClickSearchSupInvoice">Search</v-btn>
                </div>

                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="w-10">Actions</th>
                      <th>Containers</th>
                      <th>Supplier</th>
                      <th>I/E</th>
                      <th>Serie / Folio</th>
                      <th>Amount</th>
                      <th>In Req. Detentions</th>
                      <th>In Req. Detentions</th>
                      <th>In Ref invoices</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="invoiceForm.results?.length === 0">
                      <td colspan="9" class="text-center">No results.</td>
                    </tr>
                    <tr v-for="(supplierCfdi, index) in invoiceForm.results" :key="`req-detention-sp-cfdi-${index}`">
                      <td>
                        <div v-if="isAbleToLink(supplierCfdi)">
                          <v-btn color="success" size="small" @click="linkInvoice(supplierCfdi)">
                            <v-icon>mdi-link</v-icon> Link
                          </v-btn>
                        </div>
                      </td>
                      <td>
                        <div v-if="isAbleToLink(supplierCfdi)">
                          <v-autocomplete
                            v-model="supplierCfdi.containers"
                            :items="availableContainers(supplierCfdi)"
                            :item-title="(item: any) => `${item.reference_number} - ${item.container_number}`"
                            item-value="id"
                            hide-details
                            density="compact"
                            clearable
                            multiple
                            label="Containers"
                          />
                        </div>
                      </td>
                      <td>{{ supplierCfdi.supplier?.name }}</td>
                      <td>{{ supplierCfdi.tipo_comprobante }}</td>
                      <td>{{ supplierCfdi.serie_folio }}</td>
                      <td class="whitespace-nowrap">
                        <div v-if="supplierCfdi.tipo_comprobante === 'I'" class="text-green-500 font-bold">
                          {{ getCurrencyName(supplierCfdi.currency_id) }}
                          +{{ formatToCurrency(supplierCfdi.amount_cfdi) }}
                        </div>
                        <div v-if="supplierCfdi.tipo_comprobante === 'E'" class="text-red-500 font-bold">
                          {{ getCurrencyName(supplierCfdi.currency_id) }}
                          -{{ formatToCurrency(supplierCfdi.amount_cfdi) }}
                        </div>
                      </td>
                      <td>{{ supplierCfdi.req_detentions.length }}</td>
                      <td>{{ supplierCfdi.req_detentions.length }}</td>
                      <td>{{ supplierCfdi.invoices.length }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="invoiceForm.show = false">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </div>

          <v-table density="compact">
            <thead>
              <tr>
                <th class="w-10">Actions</th>
                <th>Supplier</th>
                <th>I/E</th>
                <th>Serie / Folio</th>
                <th>Amount</th>
                <th>Containers</th>
                <th>Created at</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reqDetention.req_det_invoices?.length === 0">
                <td colspan="7" class="text-center">No invoices linked in detention payment request.</td>
              </tr>
              <tr
                v-for="(reqDetInvoice, index) in reqDetention.req_det_invoices"
                :key="`req-detention-sp-cfdi-${index}`"
              >
                <td>
                  <div v-if="!isPaid && !isCancelled && !hasInvoice">
                    <TrashButton :item="reqDetInvoice" @click="showConfirmDeleteInvoice" />
                  </div>
                </td>
                <td>{{ reqDetInvoice.supplier_cfdi?.supplier?.name }}</td>
                <td>{{ reqDetInvoice.supplier_cfdi?.tipo_comprobante }}</td>
                <td>{{ reqDetInvoice.supplier_cfdi?.serie_folio }}</td>
                <td class="whitespace-nowrap">
                  <div v-if="reqDetInvoice.supplier_cfdi?.tipo_comprobante === 'I'" class="text-green-500 font-bold">
                    {{ getCurrencyName(reqDetInvoice.supplier_cfdi?.currency_id) }}
                    +{{ formatToCurrency(reqDetInvoice.supplier_cfdi?.amount_cfdi) }}
                  </div>
                  <div v-if="reqDetInvoice.supplier_cfdi?.tipo_comprobante === 'E'" class="text-red-500 font-bold">
                    {{ getCurrencyName(reqDetInvoice.supplier_cfdi?.currency_id) }}
                    -{{ formatToCurrency(reqDetInvoice.supplier_cfdi?.amount_cfdi) }}
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-2">
                    <v-chip
                      v-for="(reqDetInvoiceCont, index) in reqDetInvoice.req_det_invoice_containers"
                      color="primary"
                      :key="`req-detention-sp-cfdi-cont-${index}`"
                    >
                      {{ reqDetInvoiceCont.req_detention_container?.referencia?.reference_number }} -
                      {{ reqDetInvoiceCont.req_detention_container?.reference_container?.container_number }}
                    </v-chip>
                  </div>
                </td>
                <td>
                  <UserInfoBadge :item="reqDetInvoice">
                    {{ formatDateString(reqDetInvoice.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="showPdfDialog" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closePdfDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Preview file</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <object ref="pdfViewer" type="application/pdf" width="100%" height="100%"></object>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="sendForm.showDialog" max-width="600">
      <v-card>
        <v-card-title>Send notification to pay</v-card-title>
        <v-card-text>
          <div class="grid grid-cols-1 gap-4">
            <v-text-field v-if="false" v-model="sendForm.emails" label="Emails" density="compact" />
            <v-textarea v-model="sendForm.body" label="Additional comments" density="compact" hide-details />
            <v-alert density="compact" type="info">
              If request and invoices match will be sent a notification to pay. And a invoice will be generated to pay.
            </v-alert>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="sendForm.showDialog = false">Cancel</v-btn>
          <v-btn color="success" @click="sendNotyPay">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { schemaBankInfo } from '~~/forms/maritimeDetentionsForm'
import VeeForm from '@/components/global/VeeForm.vue'
const { $api, $notifications } = useNuxtApp()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const reqDetention = ref<any>({
  bank: '',
  beneficiary_name: '',
  account_number: '',
  aba: '',
  swift: '',
  iban: '',
})
const showPdfDialog = ref(false)
const pdfViewer = ref<any>(null)
const isEditingNotes = ref(false)
const refundBankInfoRef = ref<InstanceType<typeof VeeForm> | null>(null)

const invoiceForm = ref<any>({
  show: false,
  supplier_id: null,
  folio: null,
  results: [],
})

const sendForm = reactive({
  showDialog: false,
  emails: '',
  body: '',
})

const formEditBank = reactive({
  show: false,
})

const addNewInvoice = () => {
  invoiceForm.value.show = true
  invoiceForm.value = {
    ...invoiceForm.value,
    supplier_id: null,
    folio: null,
    results: [],
  }
}

const closePdfDialog = () => {
  pdfViewer.value!.data = null
  showPdfDialog.value = false
}

const isIngreso = (supplierCfdi: any) => {
  return supplierCfdi.tipo_comprobante === 'I'
}

const isAbleToLink = (supplierCfdi: any) => {
  if (supplierCfdi.invoices.length > 0) {
    return false
  }

  // if has req_detentions or req_detentions linked
  if (supplierCfdi.req_detentions.length > 0 || supplierCfdi.req_detentions.length > 0) {
    return false
  }

  return true
}

const isTm = computed(() => {
  return reqDetention.value.inv_type === 'tm'
})

const availableContainers = (supplierCfdi: any) => {
  const reqDetInvContainerIds = reqDetention.value.req_det_invoices
    .filter((reqDetInv: any) => reqDetInv.supplier_cfdi?.tipo_comprobante === supplierCfdi.tipo_comprobante)
    .flatMap((reqDetInv: any) => {
      return reqDetInv.req_det_invoice_containers.map((container: any) => container.req_det_container_id)
    })

  return reqDetention.value.containers
    .filter((container: any) => {
      return !reqDetInvContainerIds.includes(container.id)
    })
    .map((container: any) => {
      return {
        id: container.id,
        reference_number: container.referencia.reference_number,
        container_number: container.reference_container.container_number,
      }
    })
}

const isPaid = computed(() => {
  return reqDetention.value.invoice?.is_paid === 1
})

const formattedNotes = computed(() => {
  if (!reqDetention.value?.notes) {
    return 'Empty notes'
  }
  return reqDetention.value.notes.replace(/\n/g, '<br>')
})

const showEditBankInfo = () => {
  formEditBank.show = !formEditBank.show
  if (refundBankInfoRef.value) {
    refundBankInfoRef.value.setValues({
      bank: reqDetention.value.bank,
      beneficiary_name: reqDetention.value.beneficiary_name,
      account_number: reqDetention.value.account_number,
      clabe: reqDetention.value.clabe,
      aba: reqDetention.value.aba,
      swift: reqDetention.value.swift,
      iban: reqDetention.value.iban,
    })
  }
}

const closeEditBankInfo = () => {
  formEditBank.show = false
}

const toggleEditNotes = () => {
  isEditingNotes.value = !isEditingNotes.value
}

const isCancelled = computed(() => {
  return !!reqDetention.value.deleted_at
})

const hasInvoice = computed(() => {
  return !!reqDetention.value.invoice
})

const reqDetentionAmountNoIva = computed(() => {
  return (
    (reqDetention.value.containers || [])
      .filter((x: any) => parseFloat(x.amount_iva) === 0)
      .reduce((acc: number, reqDetContainer: any) => {
        return acc + parseFloat(reqDetContainer.amount)
      }, 0) || 0
  )
})

const reqDetentionAmountWithIva = computed(() => {
  return (
    (reqDetention.value.containers || [])
      .filter((x: any) => x.amount_iva > 0)
      .reduce((acc: number, reqDetContainer: any) => {
        return acc + parseFloat(reqDetContainer.amount || 0) + parseFloat(reqDetContainer.amount_iva || 0)
      }, 0) || 0
  )
})
const reqDetentionAmountOnlyIva = computed(() => {
  return (
    (reqDetention.value.containers || []).reduce((acc: number, detentionPayment: any) => {
      return acc + parseFloat(detentionPayment.amount_iva)
    }, 0) || 0
  )
})

const reqDetentionAmount = computed(() => {
  return (
    (reqDetention.value.containers || []).reduce((acc: number, detentionPayment: any) => {
      return acc + parseFloat(detentionPayment.amount) + parseFloat(detentionPayment.amount_iva)
    }, 0) || 0
  )
})

const reqDetentionAmountDebit = computed(() => {
  return (
    (reqDetention.value.req_det_invoices || []).reduce((acc: number, reqDetInv: any) => {
      if (reqDetInv.supplier_cfdi.tipo_comprobante === 'I') {
        return acc + parseFloat(reqDetInv.supplier_cfdi.amount_cfdi)
      }
      return acc // <== make sure to return acc when condition is not met
    }, 0) || 0
  )
})

const reqDetentionAmountCredit = computed(() => {
  return (
    (reqDetention.value.req_det_invoices || []).reduce((acc: number, reqDetInv: any) => {
      if (reqDetInv.supplier_cfdi.tipo_comprobante === 'E') {
        return acc + parseFloat(reqDetInv.supplier_cfdi.amount_cfdi)
      }
      return acc // <== make sure to return acc when condition is not met
    }, 0) || 0
  )
})

const reqDetentionAmountTotal = computed(() => {
  // restar las notas de credito al total sin iva y si falta tomar el otro total con IVA
  let totalSinIva = reqDetentionAmountNoIva.value - reqDetentionAmountCredit.value
  let totalConIva = reqDetentionAmountWithIva.value

  console.log('totalSinIva', totalSinIva)
  console.log('totalConIva', totalConIva)

  // Si el total sin IVA es negativo, restar del total con IVA
  if (totalSinIva < 0) {
    totalConIva = reqDetentionAmountWithIva.value + totalSinIva // Restar el excedente
    totalConIva = parseFloat(Math.max(totalConIva, 0).toFixed(2)) // Asegurar que no sea negativo y redondear
  }

  return Math.max(totalSinIva, 0) + totalConIva
})

const totalRequestedMatch = computed(() => {
  return reqDetentionAmount.value === reqDetentionAmountDebit.value
})

const showConfirmCancelReq = async (id: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, I confirm',
    content: 'Please confirm you want to cancel this detention request.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    await cancelRequest()
  }
}

const searchSuppliers = async (params: any) => {
  try {
    const response = await $api.suppliers.searchSuppliers({
      query: params,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching suppliers',
    })
  }
}

const cancelRequest = async () => {
  try {
    loadingStore.start()
    await $api.maritimeDetentions.cancelDetentionRequest(props.id.toString())
    snackbar.add({ type: 'success', text: 'Detention request canceled' })
    router.push('/invoices/lines/demurrage-detentions')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onSaveBankInfoClick = async (values: any) => {
  try {
    loadingStore.start()
    // only send the fields that are being updated
    const { bank, beneficiary_name, account_number, aba, swift, iban, clabe } = values

    const body = {
      req_refund_id: props.id,
      bank,
      beneficiary_name,
      account_number,
      clabe,
      aba,
      swift,
      iban,
    }
    const response = (await $api.maritimeDetentions.updateBankInfo(props.id.toString(), body)) as any

    snackbar.add({
      type: 'success',
      text: `Bank info updated`,
    })

    await getRequestDetention()
    formEditBank.show = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const showSendNotyPay = () => {
  sendForm.showDialog = true
}

const sendNotyPay = async () => {
  try {
    loadingStore.start()
    const body = {
      req_detention_id: props.id,
      emails: sendForm.emails,
      body: sendForm.body,
    }
    await $api.maritimeDetentions.sendNotifyToPay(props.id.toString(), body)
    snackbar.add({ type: 'success', text: 'Notification sent' })

    sendForm.showDialog = false
    await getRequestDetention()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const previewReqPdf = async () => {
  try {
    showPdfDialog.value = true
    loadingStore.start()
    const response = await $api.maritimeDetentions.getReqDetentionPdf(props.id.toString())

    const blob = new Blob([response as any], { type: 'application/pdf' })
    console.log(blob)
    const pdfUrl = URL.createObjectURL(blob)
    pdfViewer.value.data = pdfUrl
  } catch (e) {
    console.error(e)
    showPdfDialog.value = false
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const showConfirmDeleteInvoice = async (reqDetInvoice: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, I confirm',
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
      const body = {
        ...reqDetInvoice,
      }
      await $api.maritimeDetentions.unlinkSupplierCfdi(body)

      snackbar.add({ type: 'success', text: 'Invoice unlinked from demurrrage request payment.' })
      await getRequestDetention()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const showConfirmDelete = async (item: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, I confirm',
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
      const body = {
        ...item,
      }
      // await $api.maritimeDetentions.unlinkPayment(props.id.toString(), body)

      snackbar.add({ type: 'success', text: 'Bank Account deleted' })
      await getRequestDetention()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const linkInvoice = async (supplierCfdi: any) => {
  try {
    // if no containers selected show message
    if (supplierCfdi.containers.length === 0) {
      snackbar.add({ type: 'error', text: 'Please select at least one container' })
      return
    }

    loadingStore.start()
    const body = {
      req_detention_id: props.id,
      supplier_cfdi_id: supplierCfdi.id,
      containers: supplierCfdi.containers.map((container: any) => container),
    }
    await $api.maritimeDetentions.linkSupplierCfdi(body)

    snackbar.add({ type: 'success', text: 'Invoice linked' })
    invoiceForm.value.show = false
    await getRequestDetention()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickSearchSupInvoice = async () => {
  try {
    loadingStore.start()
    const body = {
      supplier_id: invoiceForm.value.supplier_id,
      folio: invoiceForm.value.folio,
    }
    const response = await $api.maritimeDetentions.searchSupplierCfdis(body)

    invoiceForm.value.results = response

    // add containers to each supplier cfdi
    invoiceForm.value.results = invoiceForm.value.results.map((supplierCfdi: any) => {
      return {
        ...supplierCfdi,
        containers: [],
      }
    })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveNotes = async () => {
  try {
    loadingStore.start()
    await $api.maritimeDetentions.updateNotes(props.id.toString(), { notes: reqDetention.value.notes })
    snackbar.add({ type: 'success', text: 'Notes updated' })
    isEditingNotes.value = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getRequestDetention = async () => {
  try {
    loadingStore.start()
    const response = await $api.maritimeDetentions.getById(props.id.toString())

    reqDetention.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getRequestDetention()
</script>
