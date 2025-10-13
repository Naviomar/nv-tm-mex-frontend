<template>
  <div>
    <v-card>
      <v-card-title>Request refund #{{ props.id }}</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <v-card>
            <v-card-title>
              <div class="flex justify-between gap-2">
                <div>Details</div>
                <div>
                  <v-chip :color="reqRefund.invoice?.is_paid ? 'success' : 'warning'" size="small">
                    {{ reqRefund.invoice?.is_paid ? 'Paid' : 'Pending payment' }}
                  </v-chip>
                </div>
              </div>
            </v-card-title>
            <v-card-text>
              <div class="grid grid-cols-2 gap-2">
                <div>Beneficiary</div>
                <div>{{ reqRefund.beneficiary?.name }} ({{ beneficiaryType }})</div>
                <div>Amount:</div>
                <div>{{ formatToCurrency(reqRefundAmount) }} {{ getCurrencyName(reqRefund.currency_id) }}</div>

                <div>Requested by:</div>
                <div>{{ reqRefund.creator?.name }}</div>
                <div>Created at:</div>
                <div>{{ formatDateString(reqRefund.created_at) }}</div>
              </div>
              <div class="flex gap-2 py-2">
                <v-btn color="primary" size="small" @click="previewReqPdf">View PDF</v-btn>
              </div>
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-title>
              <div class="flex items-center gap-2">
                <div v-if="!isPaid">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="() => checkUserAndExecute(reqRefund.created_by, showEditBankInfo)"
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
                  :init-values="reqRefund"
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
                <div class="grid grid-cols-3 gap-2 mb-2">
                  <div class="font-bold">Bank:</div>
                  <div class="col-span-2">{{ reqRefund.bank }}</div>
                </div>
                <div class="grid grid-cols-3 gap-2 mb-2">
                  <div class="font-bold">Beneficary name:</div>
                  <div class="col-span-2">{{ reqRefund.beneficiary_name }}</div>
                </div>
                <div class="grid grid-cols-3 gap-2 mb-2">
                  <div class="font-bold">Account number:</div>
                  <div class="col-span-2">{{ reqRefund.account_number }}</div>
                </div>
                <div class="grid grid-cols-3 gap-2 mb-2">
                  <div class="font-bold">ABA:</div>
                  <div class="col-span-2">{{ reqRefund.aba }}</div>
                </div>
                <div class="grid grid-cols-3 gap-2 mb-2">
                  <div class="font-bold">Swift:</div>
                  <div class="col-span-2">{{ reqRefund.swift }}</div>
                </div>
                <div class="grid grid-cols-3 gap-2 mb-2">
                  <div class="font-bold">IBAN:</div>
                  <div class="col-span-2">{{ reqRefund.iban }}</div>
                </div>

                <div class="flex justify-start gap-2">
                  <RefundResendNotify :req-refund="reqRefund" />
                  <RefundAttachments :req-refund="reqRefund" @refresh="getRequestRefund" />
                </div>
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
                    v-if="!isPaid"
                    size="small"
                    color="blue"
                    @click="() => checkUserAndExecute(reqRefund.created_by, toggleEditNotes)"
                    >{{ isEditingNotes ? 'Cancel' : 'Edit Notes' }}</v-btn
                  >

                  <!-- Textarea and Save Button -->
                  <div v-if="isEditingNotes">
                    <v-textarea v-model="reqRefund.notes" :rows="3" placeholder="Enter your notes here..." />
                    <v-btn color="purple" @click="saveNotes">Save changes</v-btn>
                  </div>
                </v-alert>
              </v-card-text>
            </v-card>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4">
          <v-table density="compact">
            <thead>
              <tr>
                <th class="w-10">Actions</th>
                <th>Service Ref#</th>
                <th>Concept</th>
                <th>Amount</th>
                <th>Currency</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reqRefund.refund_payments?.length === 0">
                <td colspan="5" class="text-center">No concepts found</td>
              </tr>
              <tr v-for="(refundPayment, index) in reqRefund.refund_payments" :key="`refund-payment-${index}`">
                <td>
                  <div v-if="!isPaid">
                    <TrashButton :item="refundPayment" @click="() => checkUserAndExecute(reqRefund.created_by, showConfirmDelete)" />
                  </div>
                </td>
                <td>{{ refundPayment.payable?.serviceable?.reference_number }}</td>
                <td>
                  <div>{{ refundPayment.payable?.charge?.name }}</div>
                  <div v-if="refundPayment.payable.container">
                    <div>Container: {{ refundPayment.payable.container.container_number }}</div>
                  </div>
                </td>
                <td>{{ formatToCurrency(refundPayment.amount) }}</td>
                <td>{{ getCurrencyName(refundPayment.currency_id) }}</td>
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
import { schemaBankInfo } from '~~/forms/refundsForm'
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

const reqRefund = ref<any>({
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

const sendForm = reactive({
  showDialog: false,
  emails: '',
  body: '',
})

const formEditBank = reactive({
  show: false,
})

const closePdfDialog = () => {
  pdfViewer.value!.data = null
  showPdfDialog.value = false
}

const isPaid = computed(() => {
  return reqRefund.value.invoice?.is_paid === 1
})

const formattedNotes = computed(() => {
  if (!reqRefund.value?.notes) {
    return 'Empty notes'
  }
  return reqRefund.value.notes.replace(/\n/g, '<br>')
})

const showEditBankInfo = () => {
  formEditBank.show = !formEditBank.show
  if (refundBankInfoRef.value) {
    refundBankInfoRef.value.setValues({
      bank: reqRefund.value.bank,
      beneficiary_name: reqRefund.value.beneficiary_name,
      account_number: reqRefund.value.account_number,
      aba: reqRefund.value.aba,
      swift: reqRefund.value.swift,
      iban: reqRefund.value.iban,
    })
  }
}

const closeEditBankInfo = () => {
  formEditBank.show = false
}

const toggleEditNotes = () => {
  console.log('toggleEditNotes')
  isEditingNotes.value = !isEditingNotes.value
}

const reqRefundAmount = computed(() => {
  return reqRefund.value.refund_payments.reduce((acc: number, refundPayment: any) => {
    return acc + parseFloat(refundPayment.amount)
  }, 0)
})

const beneficiaryType = computed(() => {
  if (reqRefund.value.beneficiary_type.includes('Consignee')) {
    return 'Customer'
  }
  if (reqRefund.value.beneficiary_type.includes('CustomAgent')) {
    return 'Custom Agent'
  }
  return ''
})

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
    const response = (await $api.refunds.updateBankInfo(props.id.toString(), body)) as any

    snackbar.add({
      type: 'success',
      text: `Bank info updated`,
    })

    await getRequestRefund()
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
    const response = await $api.refunds.getReqRefundPdf(props.id.toString())

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
      await $api.refunds.unlinkPayment(props.id.toString(), body)

      snackbar.add({ type: 'success', text: 'Bank Account deleted' })
      await getRequestRefund()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const saveNotes = async () => {
  try {
    loadingStore.start()
    await $api.refunds.updateNotes(props.id.toString(), { notes: reqRefund.value.notes })
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

const getRequestRefund = async () => {
  try {
    loadingStore.start()
    const response = await $api.refunds.getById(props.id.toString())

    reqRefund.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getRequestRefund()
</script>
