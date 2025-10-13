<template>
  <div>
    <v-card>
      <v-card-title>Request advance payment #{{ props.id }}</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <v-card>
            <v-card-title>
              <div class="flex justify-between gap-2">
                <div>Details</div>
                <div>
                  <v-chip :color="reqAdvPayment.invoice?.is_paid ? 'success' : 'warning'" size="small">
                    {{ reqAdvPayment.invoice?.is_paid ? 'Paid' : 'Pending to paid' }}
                  </v-chip>
                </div>
              </div>
            </v-card-title>
            <v-card-text>
              <div class="grid grid-cols-2 gap-2">
                <div>Supplier</div>
                <div>{{ reqAdvPayment.supplier?.name }}</div>
                <div>Amount:</div>
                <div>{{ getCurrencyName(reqAdvPayment.currency_id) }} {{ formatToCurrency(reqAdvPayment.amount) }}</div>
                <div>Amount available:</div>
                <div>
                  {{ getCurrencyName(reqAdvPayment.currency_id) }}
                  {{ formatToCurrency(reqAdvPayment.amount_available) }}
                </div>

                <div>Requested by:</div>
                <div>{{ reqAdvPayment.creator?.name }}</div>
                <div>Created at:</div>
                <div>
                  <UserInfoBadge :item="reqAdvPayment">
                    {{ formatDateString(reqAdvPayment.created_at) }}
                  </UserInfoBadge>
                </div>
              </div>
              <div v-if="canEdit" class="flex gap-2 py-2">
                <v-btn
                  color="red"
                  size="small"
                  @click="() => checkUserAndExecute(reqAdvPayment.created_by, showConfirmCancelReq)"
                  >Cancel advance payment</v-btn
                >
                <v-btn color="primary" size="small" @click="previewReqPdf">View PDF</v-btn>
              </div>

              <div v-if="hasPayments">
                <div class="font-bold">Payments</div>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template
                      v-for="(invCharge, index) in reqAdvPayment.invoice?.charges"
                      :key="`adv-payment-charge-${index}`"
                    >
                      <tr v-for="(payment, i) in invCharge.payments" :key="`adv-payment-payment-${i}`">
                        <td>{{ payment.id }}</td>
                        <td>{{ formatToCurrency(payment.amount) }}</td>
                        <td>
                          <v-chip color="blue" text-color="white" size="small" @click="viewPayment(payment)"
                            ><v-icon>mdi-eye-outline</v-icon>{{ paymentableName(payment) }} #{{
                              payment.paymentable_id
                            }}</v-chip
                          >
                        </td>
                        <td class="whitespace-nowrap">
                          <UserInfoBadge :item="payment">
                            {{ formatDateString(payment.created_at) }}
                          </UserInfoBadge>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </v-table>
              </div>
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-title>
              <div class="flex items-center gap-2">
                <div>
                  <v-btn
                    v-if="canEdit"
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="() => checkUserAndExecute(reqAdvPayment.created_by, showEditBankInfo)"
                    ><v-icon class="cursor-pointer">
                      {{ formEditBank.show ? 'mdi-close' : 'mdi-pencil-outline' }}
                    </v-icon></v-btn
                  >
                </div>
                <div>Beneficiary & Origin Bank</div>
              </div>
            </v-card-title>
            <v-card-text>
              <div v-if="formEditBank.show">
                <VeeForm
                  @submit="onSaveBankInfoClick"
                  :validation-schema="schemaBankInfo"
                  :init-values="reqAdvPayment"
                  ref="advPaymentBankInfoRef"
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
              <v-divider class="py-2"></v-divider>
              <div class="font-bold">Beneficiary bank</div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">Bank:</div>
                <div class="col-span-2">{{ reqAdvPayment.bank }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">Beneficary name:</div>
                <div class="col-span-2">{{ reqAdvPayment.beneficiary_name }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">Account number:</div>
                <div class="col-span-2">{{ reqAdvPayment.account_number }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">ABA:</div>
                <div class="col-span-2">{{ reqAdvPayment.aba }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">Swift:</div>
                <div class="col-span-2">{{ reqAdvPayment.swift }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">IBAN:</div>
                <div class="col-span-2">{{ reqAdvPayment.iban }}</div>
              </div>
              <v-divider class="py-2"></v-divider>
              <div class="font-bold">Origin bank</div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">System bank ID#</div>
                <div class="col-span-2">{{ reqAdvPayment.bank_account_id }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">Bank:</div>
                <div class="col-span-2">{{ reqAdvPayment.origin_bank_name }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="font-bold">Account number:</div>
                <div class="col-span-2">{{ reqAdvPayment.origin_account_number }}</div>
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

                  <v-btn
                    v-if="canEdit"
                    size="small"
                    color="blue"
                    @click="() => checkUserAndExecute(reqAdvPayment.created_by, toggleEditNotes)"
                    >{{ isEditingNotes ? 'Cancel' : 'Edit Notes' }}</v-btn
                  >

                  <!-- Textarea and Save Button -->
                  <div v-if="isEditingNotes">
                    <v-textarea v-model="reqAdvPayment.notes" :rows="3" placeholder="Enter your notes here..." />
                    <v-btn color="purple" @click="saveNotes">Save changes</v-btn>
                  </div>
                </v-alert>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 mb-4">
          <div class="font-bold">Linked supplier request payments</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Supplier Req. Payment</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reqAdvPayment.supplier_req_pay_advances?.length === 0">
                <td colspan="2">No supplier request payments linked</td>
              </tr>
              <tr
                v-for="(supReqPayment, index) in reqAdvPayment.supplier_req_pay_advances"
                :key="`sup-req-payment-${index}`"
              >
                <td>
                  <v-chip size="small" color="indigo" @click="viewSupplierReqPayment(supReqPayment)">
                    <v-icon>mdi-eye-outline</v-icon>
                    Supplier request payment #{{ supReqPayment.supplier_req_pay_id }}
                  </v-chip>
                </td>
                <td>
                  {{ getCurrencyName(supReqPayment.supplier_req_payment?.currency_id) }}
                  {{ formatToCurrency(supReqPayment.amount) }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <v-table density="compact">
            <thead>
              <tr>
                <th>Service Ref#</th>
                <th>Concepts</th>
              </tr>
              <tr>
                <th></th>
                <th>
                  <div class="grid grid-cols-3 gap-2">
                    <div>Sell concept linked</div>
                    <div>Amount</div>
                    <div>Currency</div>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="reqAdvPayment.pay_services?.length === 0">
                <td colspan="4">No services found</td>
              </tr>
              <tr v-for="(payService, index) in reqAdvPayment.pay_services" :key="`adv-payment-service-${index}`">
                <td>{{ payService.serviceable?.reference_number }}</td>
                <td>
                  <div v-for="(serviceLink, i) in payService.service_links" :key="`adv-payment-service-link-${i}`">
                    <div class="grid grid-cols-3 gap-2">
                      <div class="font-bold">{{ getLinkName(serviceLink) }}</div>
                      <div class="font-bold">
                        {{ formatToCurrency(serviceLink.amount * serviceLink.exchange_rate) }}
                      </div>
                      <div class="font-bold">{{ getCurrencyName(reqAdvPayment.currency_id) }}</div>
                    </div>
                  </div>
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
  </div>
</template>
<script setup lang="ts">
import { paymentableName } from '~/utils/data/morphNames'
import { schemaBankInfo } from '~~/forms/advPaymentsForm'
import VeeForm from '@/components/global/VeeForm.vue'
const { $api, $notifications } = useNuxtApp()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const { checkUserAndExecute } = useCheckUser()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const reqAdvPayment = ref<any>(null)
const showPdfDialog = ref(false)
const pdfViewer = ref<any>(null)
const isEditingNotes = ref(false)
const formEditBank = reactive({
  show: false,
})
const advPaymentBankInfoRef = ref<InstanceType<typeof VeeForm> | null>(null)

const closePdfDialog = () => {
  pdfViewer.value!.data = null
  showPdfDialog.value = false
}

const toggleEditNotes = () => {
  isEditingNotes.value = !isEditingNotes.value
}

const canEdit = computed(() => {
  return !reqAdvPayment.value?.deleted_at
})

const hasPayments = computed(() => {
  return (reqAdvPayment.value?.invoice?.charges || []).some((invCharge: any) => invCharge.payments.length > 0)
})

const formattedNotes = computed(() => {
  if (!reqAdvPayment.value?.notes) {
    return 'Empty notes'
  }
  return reqAdvPayment.value.notes.replace(/\n/g, '<br>')
})

const showEditBankInfo = () => {
  formEditBank.show = !formEditBank.show
  if (advPaymentBankInfoRef.value) {
    advPaymentBankInfoRef.value.setValues({
      bank: reqAdvPayment.value.bank,
      beneficiary_name: reqAdvPayment.value.beneficiary_name,
      account_number: reqAdvPayment.value.account_number,
      aba: reqAdvPayment.value.aba,
      swift: reqAdvPayment.value.swift,
      iban: reqAdvPayment.value.iban,
    })
  }
}

const closeEditBankInfo = () => {
  formEditBank.show = false
}

const getLinkName = (serviceLink: any) => {
  if (serviceLink.chargeable_type.includes('ReferenceSellRateCharge')) {
    return serviceLink.chargeable?.charge?.name
  }
  if (serviceLink.chargeable_type.includes('ReferenceCharge')) {
    return serviceLink.chargeable?.charge?.name
  }
  if (serviceLink.chargeable_type.includes('ReferenceExportCharge')) {
    return serviceLink.chargeable?.charge?.name
  }
  if (serviceLink.chargeable_type.includes('FfNote')) {
    return `FF Note #${serviceLink.chargeable?.id} From TM Debit`
  }
  return 'Unknown'
}

const viewPayment = (payment: any) => {
  console.log('payment', payment)
  if (payment.paymentable_type.includes('BankMovement')) {
    router.push(`/transfers/global/view-${payment.paymentable_id}?focusPayable=${payment.id}`)
    return
  }
  snackbar.add({ type: 'error', text: 'Unknown payment type' })
}

const viewSupplierReqPayment = (supReqPayment: any) => {
  router.push(`/invoices/suppliers/cfdis/request-payment/view-${supReqPayment.supplier_req_pay_id}`)
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
    const response = (await $api.advancePayments.updateBankInfo(props.id.toString(), body)) as any

    snackbar.add({
      type: 'success',
      text: `Bank info updated`,
    })

    await getReqAdvPayment()
    formEditBank.show = false
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
    const response = await $api.advancePayments.getReqAdvPayPdf(props.id.toString())

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

const cancelRequest = async () => {
  try {
    loadingStore.start()
    await $api.advancePayments.cancelAdvRequest(props.id.toString())
    snackbar.add({ type: 'success', text: 'Advance payment canceled' })
    router.push('/advance-payments')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const showConfirmCancelReq = async () => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, I confirm',
    content: 'Please confirm you want to cancel this advance payment.',
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

const saveNotes = async () => {
  try {
    loadingStore.start()
    await $api.advancePayments.updateNotes(props.id.toString(), { notes: reqAdvPayment.value.notes })
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

const getReqAdvPayment = async () => {
  try {
    loadingStore.start()
    const response = await $api.advancePayments.getById(props.id.toString())

    reqAdvPayment.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getReqAdvPayment()
</script>
