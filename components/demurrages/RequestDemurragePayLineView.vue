<template>
  <div>
    <v-card>
      <v-card-title>Request pay line demurrage #{{ props.id }}</v-card-title>
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
                    <div v-if="!reqDemurrage.invoice">
                      <v-chip color="warning" size="small" variant="outlined"> Pending invoice </v-chip>
                    </div>
                    <div v-if="reqDemurrage.invoice">
                      <v-chip :color="reqDemurrage.invoice?.is_paid ? 'success' : 'warning'" size="small">
                        {{ reqDemurrage.invoice?.is_paid ? 'Paid' : 'Pending payment' }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-title>
            <v-card-text>
              <div class="grid grid-cols-2 gap-1">
                <div>Freight line</div>
                <div>{{ reqDemurrage.line?.name }}</div>
                <div>Invoice type:</div>
                <div>{{ reqDemurrage.inv_type }}</div>
                <div>Request Amount</div>
                <div class="font-bold">{{ formatToCurrency(reqDemurrageAmount) }}</div>
                <div>Debit Linked:</div>
                <div>{{ formatToCurrency(reqDemurrageAmountDebit) }}</div>
                <div>Credit Linked:</div>
                <div class="text-red-500">-{{ formatToCurrency(reqDemurrageAmountCredit) }}</div>
                <div>Total To Pay</div>
                <div class="font-bold">
                  {{ formatToCurrency(reqDemurrageAmountTotal) }}
                </div>

                <div>Requested by:</div>
                <div>{{ reqDemurrage.creator?.name }}</div>
                <div>Created at:</div>
                <div>{{ formatDateString(reqDemurrage.created_at) }}</div>
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
                  >Cancel demurrage request</v-btn
                >

                <v-btn color="lime-darken-2" size="small" @click="previewReqPdf">View PDF</v-btn>

                <div v-if="!isCancelled" class="flex justify-start gap-2">
                  <ReqDemurrageAttachments :req-demurrage="reqDemurrage" />
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
                    <div class="col-span-2">{{ reqDemurrage.origin_bank_name }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">Account number:</div>
                    <div class="col-span-2">{{ reqDemurrage.origin_account_number }}</div>
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
                    :init-values="reqDemurrage"
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
                    <div class="col-span-2">{{ reqDemurrage.bank }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">Beneficary name:</div>
                    <div class="col-span-2">{{ reqDemurrage.beneficiary_name }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">Account number:</div>
                    <div class="col-span-2">{{ reqDemurrage.account_number }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">CLABE:</div>
                    <div class="col-span-2">{{ reqDemurrage.clabe }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">ABA:</div>
                    <div class="col-span-2">{{ reqDemurrage.aba }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">Swift:</div>
                    <div class="col-span-2">{{ reqDemurrage.swift }}</div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="font-bold">IBAN:</div>
                    <div class="col-span-2">{{ reqDemurrage.iban }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 mb-4">
          <div class="text-base font-bold">Container - Demurrages</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="w-10">Actions</th>
                <th>Service Ref#</th>
                <th>Container</th>
                <th>Demurrage pay line</th>
                <th v-if="isTm">IVA</th>
                <th>Currency</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reqDemurrage.containers?.length === 0">
                <td colspan="6" class="text-center">No containers in request.</td>
              </tr>
              <tr v-for="(demContainer, index) in reqDemurrage.containers" :key="`req-demurrage-cont-${index}`">
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
                      <th>In Req. Demurrages</th>
                      <th>In Req. Detentions</th>
                      <th>In Ref invoices</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="invoiceForm.results?.length === 0">
                      <td colspan="9" class="text-center">No results.</td>
                    </tr>
                    <tr v-for="(supplierCfdi, index) in invoiceForm.results" :key="`req-demurrage-sp-cfdi-${index}`">
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
                      <td>{{ supplierCfdi.req_demurrages.length }}</td>
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
              <tr v-if="reqDemurrage.req_dem_invoices?.length === 0">
                <td colspan="7" class="text-center">No invoices linked in demurrage payment request.</td>
              </tr>
              <tr
                v-for="(reqDemInvoice, index) in reqDemurrage.req_dem_invoices"
                :key="`req-demurrage-sp-cfdi-${index}`"
              >
                <td>
                  <div v-if="!isPaid && !isCancelled && !hasInvoice">
                    <TrashButton :item="reqDemInvoice" @click="showConfirmDeleteInvoice" />
                  </div>
                </td>
                <td>{{ reqDemInvoice.supplier_cfdi?.supplier?.name }}</td>
                <td>{{ reqDemInvoice.supplier_cfdi?.tipo_comprobante }}</td>
                <td>{{ reqDemInvoice.supplier_cfdi?.serie_folio }}</td>
                <td class="whitespace-nowrap">
                  <div v-if="reqDemInvoice.supplier_cfdi?.tipo_comprobante === 'I'" class="text-green-500 font-bold">
                    {{ getCurrencyName(reqDemInvoice.supplier_cfdi?.currency_id) }}
                    +{{ formatToCurrency(reqDemInvoice.supplier_cfdi?.amount_cfdi) }}
                  </div>
                  <div v-if="reqDemInvoice.supplier_cfdi?.tipo_comprobante === 'E'" class="text-red-500 font-bold">
                    {{ getCurrencyName(reqDemInvoice.supplier_cfdi?.currency_id) }}
                    -{{ formatToCurrency(reqDemInvoice.supplier_cfdi?.amount_cfdi) }}
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-2">
                    <v-chip
                      v-for="(reqDemInvoiceCont, index) in reqDemInvoice.req_dem_invoice_containers"
                      color="primary"
                      :key="`req-demurrage-sp-cfdi-cont-${index}`"
                    >
                      {{ reqDemInvoiceCont.req_demurrage_container?.referencia?.reference_number }} -
                      {{ reqDemInvoiceCont.req_demurrage_container?.reference_container?.container_number }}
                    </v-chip>
                  </div>
                </td>
                <td>
                  <UserInfoBadge :item="reqDemInvoice">
                    {{ formatDateString(reqDemInvoice.created_at) }}
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
import { schemaBankInfo } from '~~/forms/maritimeDemurragesForm'
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

const reqDemurrage = ref<any>({
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

  // if has req_demurrages or req_detentions linked
  if (supplierCfdi.req_demurrages.length > 0 || supplierCfdi.req_detentions.length > 0) {
    return false
  }

  return true
}

const isTm = computed(() => {
  return reqDemurrage.value.inv_type === 'tm'
})

const availableContainers = (supplierCfdi: any) => {
  return reqDemurrage.value.containers.map((container: any) => {
    return {
      id: container.id,
      reference_number: container.referencia.reference_number,
      container_number: container.reference_container.container_number,
    }
  })

  // const reqDemInvContainerIds = reqDemurrage.value.req_dem_invoices
  //   .filter((reqDemInv: any) => reqDemInv.supplier_cfdi?.tipo_comprobante === supplierCfdi.tipo_comprobante)
  //   .flatMap((reqDemInv: any) => {
  //     return reqDemInv.req_dem_invoice_containers.map((container: any) => container.req_dem_container_id)
  //   })

  // return reqDemurrage.value.containers
  //   .filter((container: any) => {
  //     return !reqDemInvContainerIds.includes(container.id)
  //   })
  //   .map((container: any) => {
  //     return {
  //       id: container.id,
  //       reference_number: container.referencia.reference_number,
  //       container_number: container.reference_container.container_number,
  //     }
  //   })
}

const isPaid = computed(() => {
  return reqDemurrage.value.invoice?.is_paid === 1
})

const formattedNotes = computed(() => {
  if (!reqDemurrage.value?.notes) {
    return 'Empty notes'
  }
  return reqDemurrage.value.notes.replace(/\n/g, '<br>')
})

const showEditBankInfo = () => {
  formEditBank.show = !formEditBank.show
  if (refundBankInfoRef.value) {
    refundBankInfoRef.value.setValues({
      bank: reqDemurrage.value.bank,
      beneficiary_name: reqDemurrage.value.beneficiary_name,
      account_number: reqDemurrage.value.account_number,
      clabe: reqDemurrage.value.clabe,
      aba: reqDemurrage.value.aba,
      swift: reqDemurrage.value.swift,
      iban: reqDemurrage.value.iban,
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
  return !!reqDemurrage.value.deleted_at
})

const hasInvoice = computed(() => {
  return !!reqDemurrage.value.invoice
})

const reqDemurrageAmountNoIva = computed(() => {
  return (
    (reqDemurrage.value.containers || [])
      .filter((x: any) => parseFloat(x.amount_iva) === 0)
      .reduce((acc: number, demurragePayment: any) => {
        return acc + parseFloat(demurragePayment.amount)
      }, 0) || 0
  )
})

const reqDemurrageAmountWithIva = computed(() => {
  return (
    (reqDemurrage.value.containers || [])
      .filter((x: any) => x.amount_iva > 0)
      .reduce((acc: number, demurragePayment: any) => {
        return acc + parseFloat(demurragePayment.amount || 0) + parseFloat(demurragePayment.amount_iva || 0)
      }, 0) || 0
  )
})

const reqDemurrageAmountOnlyIva = computed(() => {
  return (
    (reqDemurrage.value.containers || []).reduce((acc: number, demurragePayment: any) => {
      return acc + parseFloat(demurragePayment.amount_iva)
    }, 0) || 0
  )
})

const reqDemurrageAmount = computed(() => {
  return (
    (reqDemurrage.value.containers || []).reduce((acc: number, demurragePayment: any) => {
      return acc + parseFloat(demurragePayment.amount) + parseFloat(demurragePayment.amount_iva)
    }, 0) || 0
  )
})

const reqDemurrageAmountDebit = computed(() => {
  return (
    (reqDemurrage.value.req_dem_invoices || []).reduce((acc: number, reqDemInv: any) => {
      if (reqDemInv.supplier_cfdi.tipo_comprobante === 'I') {
        return acc + parseFloat(reqDemInv.supplier_cfdi.amount_cfdi)
      }
      return acc // <== make sure to return acc when condition is not met
    }, 0) || 0
  )
})

const reqDemurrageAmountCredit = computed(() => {
  return (
    (reqDemurrage.value.req_dem_invoices || []).reduce((acc: number, reqDemInv: any) => {
      if (reqDemInv.supplier_cfdi.tipo_comprobante === 'E') {
        return acc + parseFloat(reqDemInv.supplier_cfdi.amount_cfdi)
      }
      return acc // <== make sure to return acc when condition is not met
    }, 0) || 0
  )
})

const reqDemurrageAmountTotal = computed(() => {
  // restar las notas de credito al total sin iva y si falta tomar el otro total con IVA
  let totalSinIva = reqDemurrageAmountNoIva.value - reqDemurrageAmountCredit.value
  let totalConIva = reqDemurrageAmountWithIva.value

  console.log('totalSinIva', totalSinIva)
  console.log('totalConIva', totalConIva)

  // Si el total sin IVA es negativo, restar del total con IVA
  if (totalSinIva < 0) {
    totalConIva = reqDemurrageAmountWithIva.value + totalSinIva // Restar el excedente
    totalConIva = parseFloat(Math.max(totalConIva, 0).toFixed(2)) // Asegurar que no sea negativo y redondear
  }

  return Math.max(totalSinIva, 0) + totalConIva
})

const totalRequestedMatch = computed(() => {
  return reqDemurrageAmount.value === reqDemurrageAmountDebit.value
})

const showConfirmCancelReq = async (id: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, I confirm',
    content: 'Please confirm you want to cancel this demurrage request.',
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
    await $api.maritimeDemurrages.cancelDemurrageRequest(props.id.toString())
    snackbar.add({ type: 'success', text: 'Demurrage request canceled' })
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
    const response = (await $api.maritimeDemurrages.updateBankInfo(props.id.toString(), body)) as any

    snackbar.add({
      type: 'success',
      text: `Bank info updated`,
    })

    await getRequestDemurrage()
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
      req_demurrage_id: props.id,
      emails: sendForm.emails,
      body: sendForm.body,
    }
    await $api.maritimeDemurrages.sendNotifyToPay(props.id.toString(), body)
    snackbar.add({ type: 'success', text: 'Notification sent' })

    sendForm.showDialog = false
    await getRequestDemurrage()
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
    const response = await $api.maritimeDemurrages.getReqDemurragePdf(props.id.toString())

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

const showConfirmDeleteInvoice = async (reqDemInvoice: any) => {
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
        ...reqDemInvoice,
      }
      await $api.maritimeDemurrages.unlinkSupplierCfdi(body)

      snackbar.add({ type: 'success', text: 'Invoice unlinked from demurrrage request payment.' })
      await getRequestDemurrage()
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
      // await $api.maritimeDemurrages.unlinkPayment(props.id.toString(), body)

      snackbar.add({ type: 'success', text: 'Bank Account deleted' })
      await getRequestDemurrage()
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
      req_demurrage_id: props.id,
      supplier_cfdi_id: supplierCfdi.id,
      containers: supplierCfdi.containers.map((container: any) => container),
    }
    await $api.maritimeDemurrages.linkSupplierCfdi(body)

    snackbar.add({ type: 'success', text: 'Invoice linked' })
    invoiceForm.value.show = false
    await getRequestDemurrage()
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
    const response = await $api.maritimeDemurrages.searchSupplierCfdis(body)

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
    await $api.maritimeDemurrages.updateNotes(props.id.toString(), { notes: reqDemurrage.value.notes })
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

const getRequestDemurrage = async () => {
  try {
    loadingStore.start()
    const response = await $api.maritimeDemurrages.getById(props.id.toString())

    reqDemurrage.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getRequestDemurrage()
</script>
