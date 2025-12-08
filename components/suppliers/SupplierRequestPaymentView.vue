<template>
  <div>
    <v-card :class="isDeleted ? 'bg-red-200 dark:bg-red-800!' : ''">
      <v-card-title>Supplier - Request payment #{{ props.id }}</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <v-card>
            <v-card-title>
              <div class="flex justify-between gap-2">
                <div>Details</div>
                <div>
                  <v-chip :color="supReqPayment.invoice?.is_paid ? 'success' : 'warning'" size="small">
                    {{ supReqPayment.invoice?.is_paid ? 'Paid' : 'Pending' }}
                  </v-chip>
                </div>
              </div>
            </v-card-title>
            <v-card-text>
              <div class="grid grid-cols-2 gap-2">
                <div>Supplier</div>
                <div>{{ supReqPayment.supplier?.name }}</div>
                <div v-if="supReqPayment.currency_id !== 2">
                  Amount USD: <span class="font-bold">({{ exchangeRate }})</span>
                </div>
                <div v-if="supReqPayment.currency_id !== 2">
                  {{ formatToCurrency(getUsdAmount) }} {{ getCurrencyName(2) }}
                </div>
                <div>Amount:</div>
                <div>{{ formatToCurrency(supReqPayment.amount) }} {{ getCurrencyName(supReqPayment.currency_id) }}</div>
                <div>Amount paid:</div>
                <div>
                  {{ formatToCurrency(supReqPayment.invoice?.amount_paid) }}
                  {{ getCurrencyName(supReqPayment.currency_id) }}
                </div>

                <div>Requested by:</div>
                <div>{{ supReqPayment.creator?.name }}</div>
                <div>Created at:</div>
                <div>
                  <UserInfoBadge :item="supReqPayment">
                    {{ formatDateString(supReqPayment.created_at) }}
                  </UserInfoBadge>
                </div>
              </div>
              <div class="flex gap-2 py-2">
                <v-btn color="primary" size="small" @click="previewReqPdf">View PDF</v-btn>
                <v-btn color="purple" size="small" @click="showSendByEmail">Send by email</v-btn>
                <ReqSupplierPaymentAttachments :sup-req-payment="supReqPayment" />
                <v-btn v-if="!isUSD" color="indigo" size="small" @click="showUpdateExchangeRate"
                  >Update exchange rate</v-btn
                >
              </div>
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-title>
              <div class="flex items-center gap-2">
                <div>
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
                  :init-values="supReqPayment"
                  ref="reqSupPayBankInfoRef"
                >
                  <div class="font-bold mb-4">Update bank information</div>
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
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">Bank:</div>
                <div class="col-span-2">{{ supReqPayment.bank }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">Beneficary name:</div>
                <div class="col-span-2">{{ supReqPayment.beneficiary_name }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">Account number:</div>
                <div class="col-span-2">{{ supReqPayment.account_number }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">ABA:</div>
                <div class="col-span-2">{{ supReqPayment.aba }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">Swift:</div>
                <div class="col-span-2">{{ supReqPayment.swift }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">IBAN:</div>
                <div class="col-span-2">{{ supReqPayment.iban }}</div>
              </div>
              <v-divider class="py-2"></v-divider>
              <div class="font-bold">Origin bank</div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">System bank ID#</div>
                <div class="col-span-2">{{ supReqPayment.bank_account_id }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">Bank:</div>
                <div class="col-span-2">{{ supReqPayment.origin_bank_name }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">Account number:</div>
                <div class="col-span-2">{{ supReqPayment.origin_account_number }}</div>
              </div>
            </v-card-text>
          </v-card>
        </div>
        <div class="grid grid-cols-1 gap-4 mb-4">
          <div>
            <v-card>
              <v-card-title>Notes</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal">
                  <div v-html="formattedNotes"></div>

                  <v-btn v-if="supReqPayment.deleted_at == null" size="small" color="blue" @click="toggleEditNotes">{{
                    isEditingNotes ? 'Cancel' : 'Edit Notes'
                  }}</v-btn>

                  <!-- Textarea and Save Button -->
                  <div v-if="isEditingNotes">
                    <v-textarea v-model="supReqPayment.notes" :rows="3" placeholder="Enter your notes here..." />
                    <v-btn color="purple" @click="saveNotes">Save changes</v-btn>
                  </div>
                </v-alert>
              </v-card-text>
            </v-card>
          </div>
          <div></div>
        </div>
        <div class="grid grid-cols-1 gap-4 mb-4">
          <div class="font-bold">Linked advance payments</div>
          <!-- TODO Poder quitar los anticipos con su payment para poder cancelar la solicitud. -->
          <v-table v-if="!isDeleted" density="compact">
            <thead>
              <tr>
                <th>Advance payment #</th>
                <th>Amount applied</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="supReqPayment.pay_advances?.length === 0">
                <td colspan="3" class="text-center">No advance payments linked</td>
              </tr>
              <tr v-for="(advPayment, index) in supReqPayment.pay_advances" :key="`adv-payment-${index}`">
                <td>
                  <v-chip size="small" color="purple" @click="viewAdvancePayment(advPayment)">
                    <v-icon>mdi-eye-outline</v-icon>
                    Advance #{{ advPayment.req_advance_payment_id }}
                  </v-chip>
                </td>
                <td>
                  {{ getCurrencyName(advPayment.req_advance_payment?.currency_id) }}
                  {{ formatToCurrency(advPayment.amount) }}
                </td>
                <td>
                  <v-chip
                    :color="advPayment.req_advance_payment?.invoice?.is_paid === 1 ? 'green' : 'warning'"
                    text-color="white"
                    small
                    class="capitalize"
                  >
                    {{ advPayment.req_advance_payment?.invoice?.is_paid ? 'Paid' : 'Payment pending' }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- Resumen de anticipos aplicados -->
          <v-alert
            v-if="supReqPayment.pay_advances?.length > 0"
            :type="paymentBalanceType"
            variant="tonal"
            density="compact"
          >
            <div class="grid grid-cols-2 gap-2">
              <div class="font-bold">Total invoices:</div>
              <div>{{ getCurrencyName(supReqPayment.currency_id) }} {{ formatToCurrency(supReqPayment.amount) }}</div>

              <div class="font-bold">Total advances applied:</div>
              <div>{{ getCurrencyName(supReqPayment.currency_id) }} {{ formatToCurrency(totalAdvancesApplied) }}</div>

              <div class="font-bold text-lg border-t pt-2">
                {{ paymentBalance >= 0 ? 'Total to pay:' : 'Balance in favor:' }}
              </div>
              <div class="font-bold text-lg border-t pt-2">
                {{ getCurrencyName(supReqPayment.currency_id) }} {{ formatToCurrency(Math.abs(paymentBalance)) }}
              </div>

              <div v-if="advancesCoverTotal" class="col-span-2">
                <v-chip color="success" size="small">
                  <v-icon>mdi-check-circle</v-icon>
                  Advances cover the total amount
                </v-chip>
              </div>
            </div>
          </v-alert>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div v-if="hasInvoiceAmountPaid">
            <v-alert type="warning" variant="tonal" density="compact">
              <div class="font-bold">This request payment has payments, you cannot modify invoices.</div>
            </v-alert>
          </div>
          <div v-if="!hasInvoiceAmountPaid">
            <SupplierReqPayAddInvoice :supReqPayment="supReqPayment" @addInvoice="addToSupReqPayment" />
          </div>

          <div class="font-bold">Linked invoices</div>
          <v-table v-if="!isDeleted" density="compact">
            <thead>
              <tr>
                <th>Actions</th>
                <th>Supplier Inv#</th>
                <th>Service Ref#</th>
                <th>Concept</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>IVA</th>
                <th>Ret. IVA</th>
                <th>Ret. ISR</th>
                <th>Subtotal</th>
                <th>Sell links</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="supReqPayment.supplier_invoices?.length === 0">
                <td colspan="11" class="text-center">No concepts found</td>
              </tr>
              <tr v-for="(invoice, index) in supReqPayment.supplier_invoices" :key="`sup-invoice-${index}`">
                <td>
                  <ProcessAuthorizationWrapper
                    v-if="!hasInvoiceAmountPaid"
                    processName="supplier-request-unlink-invoice"
                    :requestKey="`${props.id}:${invoice.id}`"
                    label="Unlink invoice"
                  >
                    <template #auth>
                      <TrashButton :item="invoice" @click="confirmDeleteSupReqInv(invoice)" />
                    </template>
                  </ProcessAuthorizationWrapper>
                </td>
                <td>
                  {{ invoice.cfdi?.serie_folio }}
                </td>
                <td>{{ invoice.referenceable?.reference_number }}</td>
                <td>{{ invoice.chargeable?.name }}</td>
                <td>{{ formatToCurrency(invoice.amount) }}</td>
                <td>{{ getCurrencyName(invoice.currency_id) }}</td>
                <td class="text-green">{{ formatToCurrency(invoice.amount_iva) }}</td>
                <td class="text-red">-{{ formatToCurrency(invoice.amount_ret_iva) }}</td>
                <td class="text-red">-{{ formatToCurrency(invoice.amount_ret_isr) }}</td>
                <td class="font-bold">{{ formatToCurrency(invoice.amount_total) }}</td>
                <td>
                  <div class="flex gap-2">
                    <div v-for="(link, index) in invoice.links" :key="`invoice-link-${index}`">
                      <v-chip color="primary" size="small" class="mr-2">
                        {{ getLinkName(link) }}
                      </v-chip>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-table v-if="isDeleted" density="compact">
            <thead>
              <tr>
                <th>Service Ref#</th>
                <th>Concept</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>IVA</th>
                <th>Ret. IVA</th>
                <th>Ret. ISR</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="supReqPayment.pay_invoices_all?.length === 0">
                <td colspan="8">No concepts found</td>
              </tr>
              <tr v-for="(payInvoice, index) in supReqPayment.pay_invoices_all" :key="`sup-invoice-${index}`">
                <td>{{ payInvoice.supplier_invoice?.referenceable?.reference_number }}</td>
                <td>{{ payInvoice.supplier_invoice?.chargeable?.name }}</td>
                <td>{{ formatToCurrency(payInvoice.supplier_invoice?.amount) }}</td>
                <td>{{ getCurrencyName(payInvoice.supplier_invoice?.currency_id) }}</td>
                <td class="text-green">{{ formatToCurrency(payInvoice.supplier_invoice?.amount_iva) }}</td>
                <td class="text-red">-{{ formatToCurrency(payInvoice.supplier_invoice?.amount_ret_iva) }}</td>
                <td class="text-red">-{{ formatToCurrency(payInvoice.supplier_invoice?.amount_ret_isr) }}</td>
                <td class="font-bold">{{ formatToCurrency(payInvoice.supplier_invoice?.amount_total) }}</td>
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
    <v-dialog v-model="formSendEmail.show" max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h5">Send notification via email</span>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <v-text-field v-model="formSendEmail.to" label="To" density="compact" />
            </div>
            <div>
              <v-textarea v-model="formSendEmail.body" label="Body" density="compact" :rows="5" />
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="closeFormSendEmail">Close</v-btn>
          <v-btn color="primary" @click="sendEmail">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="formExchangeRate.show" max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h5">Update Exchange rate</span>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <v-text-field v-model="formExchangeRate.rate" label="New Exchange rate" type="number" density="compact" />
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="closeFormExRate">Close</v-btn>
          <v-btn color="primary" @click="updateExchageRate">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { schemaBankInfo } from '~~/forms/supplierReqPaymentsForm'
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

const supReqPayment = ref<any>({})
const showPdfDialog = ref(false)
const pdfViewer = ref<any>(null)
const isEditingNotes = ref(false)
const reqSupPayBankInfoRef = ref<InstanceType<typeof VeeForm> | null>(null)

const closePdfDialog = () => {
  pdfViewer.value!.data = null
  showPdfDialog.value = false
}

const formEditBank = reactive({
  show: false,
})

const formSendEmail = reactive<any>({
  show: false,
  to: '',
  body: null,
})

const formExchangeRate = reactive<any>({
  show: false,
  rate: 0,
})

const exchangeRate = computed(() => {
  if (supReqPayment.value.exchange_rate_display) {
    return supReqPayment.value.exchange_rate_display
  }
  return (1 / supReqPayment.value.exchange_rate).toFixed(4)
})

const isUSD = computed(() => {
  return supReqPayment.value.currency_id === 2
})

const showSendByEmail = () => {
  if (isDeleted.value) {
    snackbar.add({ type: 'warning', text: 'This supplier request payment is deleted' })
    return
  }
  formSendEmail.show = true
}

const closeFormSendEmail = () => {
  formSendEmail.show = false
}

const toggleEditNotes = () => {
  isEditingNotes.value = !isEditingNotes.value
}

const showUpdateExchangeRate = () => {
  if (isDeleted.value) {
    snackbar.add({ type: 'warning', text: 'This supplier request payment is deleted' })
    return
  }
  formExchangeRate.rate = (1 / supReqPayment.value.exchange_rate).toFixed(4)
  formExchangeRate.show = !formExchangeRate.show
}

const closeFormExRate = () => {
  formExchangeRate.show = false
}

const showEditBankInfo = () => {
  if (isDeleted.value) {
    snackbar.add({ type: 'warning', text: 'This supplier request payment is deleted' })
    return
  }

  formEditBank.show = !formEditBank.show
  if (reqSupPayBankInfoRef.value) {
    reqSupPayBankInfoRef.value.setValues({
      bank: supReqPayment.value.bank,
      beneficiary_name: supReqPayment.value.beneficiary_name,
      account_number: supReqPayment.value.account_number,
      aba: supReqPayment.value.aba,
      swift: supReqPayment.value.swift,
      iban: supReqPayment.value.iban,
    })
  }
}

const closeEditBankInfo = () => {
  formEditBank.show = false
}

const getUsdAmount = computed(() => {
  return parseFloat(supReqPayment.value.amount) * parseFloat(supReqPayment.value.exchange_rate)
})

const isDeleted = computed(() => {
  return supReqPayment.value.deleted_at != null
})

const hasInvoiceAmountPaid = computed(() => {
  return supReqPayment.value.invoice?.amount_paid > 0
})

// Computed properties para anticipos aplicados
const totalAdvancesApplied = computed(() => {
  if (!supReqPayment.value.pay_advances?.length) return 0
  return supReqPayment.value.pay_advances.reduce((acc: number, adv: any) => {
    return acc + parseFloat(adv.amount || 0)
  }, 0)
})

const paymentBalance = computed(() => {
  const totalInvoices = parseFloat(supReqPayment.value.amount || 0)
  return totalInvoices - totalAdvancesApplied.value
})

const advancesCoverTotal = computed(() => {
  return totalAdvancesApplied.value >= parseFloat(supReqPayment.value.amount || 0)
})

const paymentBalanceType = computed(() => {
  if (paymentBalance.value <= 0) return 'success'
  if (totalAdvancesApplied.value > 0) return 'info'
  return 'warning'
})

const formattedNotes = computed(() => {
  if (!supReqPayment.value?.notes) {
    return 'Empty notes'
  }
  return supReqPayment.value.notes.replace(/\n/g, '<br>')
})

const viewAdvancePayment = (advPayment: any) => {
  router.push(`/advance-payments/view-${advPayment.req_advance_payment_id}`)
}

const getLinkName = (link: any) => {
  if (link.chargeable_type.includes('Charge')) {
    return link.chargeable?.charge?.name
  }
  if (link.chargeable_type.includes('FfNote')) {
    return `F.F. Note #${link.chargeable_id} From TM Debit`
  }
  return 'Unknown link name'
}

const addToSupReqPayment = async (invoice: any) => {
  try {
    loadingStore.loading = true
    const body = {
      supplier_invoice_id: invoice.id,
    }
    await $api.supplierReqPayments.reqSupPaymentLinkInvoice(supReqPayment.value.id, body)
    snackbar.add({ type: 'success', text: 'Invoice linked' })
    await getSupReqPayment()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const confirmDeleteSupReqInv = async (invoice: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, delete it',
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
      await $api.supplierReqPayments.deleteSupReqInvoice(props.id!.toString(), invoice)
      snackbar.add({
        type: 'success',
        text: 'Invoice unlinked successfully',
      })
      await getSupReqPayment()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const previewReqPdf = async () => {
  try {
    showPdfDialog.value = true
    loadingStore.start()
    const response = await $api.supplierReqPayments.getReqPaymentPdf(props.id.toString())

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

const saveNotes = async () => {
  try {
    loadingStore.start()
    await $api.supplierReqPayments.updateNotes(props.id.toString(), { notes: supReqPayment.value.notes })
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

const sendEmail = async () => {
  try {
    if (!formSendEmail.to || !formSendEmail.body) {
      snackbar.add({ type: 'warning', text: 'Please fill all fields' })
      return
    }
    loadingStore.start()
    const body = {
      to: formSendEmail.to,
      body: formSendEmail.body,
    }
    await $api.supplierReqPayments.sendSupReqPayNoty(props.id.toString(), body)
    snackbar.add({ type: 'success', text: 'Notes updated' })
    formSendEmail.show = false
    formSendEmail.to = ''
    formSendEmail.body = ''
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const updateExchageRate = async () => {
  try {
    if (formExchangeRate.rate <= 0) {
      snackbar.add({ type: 'warning', text: 'Please enter a valid exchange rate' })
      return
    }
    loadingStore.start()
    const body = {
      exchange_rate: formExchangeRate.rate,
    }
    await $api.supplierReqPayments.updateExchangeRate(props.id.toString(), body)
    snackbar.add({ type: 'success', text: 'Exchange rate updated' })
    formExchangeRate.show = false

    await getSupReqPayment()
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
    const { bank, beneficiary_name, account_number, aba, swift, iban } = values

    const body = {
      req_refund_id: props.id,
      bank,
      beneficiary_name,
      account_number,
      aba,
      swift,
      iban,
    }
    const response = (await $api.supplierReqPayments.updateBankInfo(props.id.toString(), body)) as any

    snackbar.add({
      type: 'success',
      text: `Bank info updated`,
    })

    await getSupReqPayment()
    formEditBank.show = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSupReqPayment = async () => {
  try {
    loadingStore.start()
    const response = await $api.supplierReqPayments.getById(props.id.toString())

    supReqPayment.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getSupReqPayment()
</script>
