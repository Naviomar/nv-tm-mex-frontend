<template>
  <div>
    <v-card>
      <v-card-title>Freight line - Credit Note #{{ lineCreditNote.folio_real }}</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <v-card>
            <v-card-title>
              <div class="flex justify-between gap-2">
                <div>Details</div>
                <div>
                  <v-chip :color="lineCreditNote.amount_available <= 0 ? 'success' : 'warning'" size="small">
                    {{ lineCreditNote.amount_available <= 0 ? 'Used' : 'Pending to use' }}
                  </v-chip>
                </div>
              </div>
            </v-card-title>
            <v-card-text>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <div class="">Folio</div>
                </div>
                <div class="font-bold">
                  <div class="flex items-center gap-2">
                    <div class="">
                      <v-icon color="green" @click="showDialog">mdi-pencil-outline</v-icon>
                    </div>
                    <div>{{ lineCreditNote.folio_real }}</div>
                  </div>
                </div>
                <div>Freight line</div>
                <div>{{ lineCreditNote.line?.name }}</div>
                <div>Amount:</div>
                <div>
                  {{ formatToCurrency(lineCreditNote.amount) }} {{ getCurrencyName(lineCreditNote.currency_id) }}
                </div>
                <div>Amount available:</div>
                <div>
                  {{ formatToCurrency(lineCreditNote.amount_available) }}
                  {{ getCurrencyName(lineCreditNote.currency_id) }}
                </div>

                <div>Requested by:</div>
                <div>{{ lineCreditNote.creator?.name }}</div>
                <div>Created at:</div>
                <div>
                  <UserInfoBadge :item="lineCreditNote">
                    {{ formatDateString(lineCreditNote.created_at) }}
                  </UserInfoBadge>
                </div>
                <div>Attachment:</div>
                <div>
                  <ButtonDownloadS3Object :s3Path="lineCreditNote.attachment" />
                </div>
              </div>

              <InvoiceChargePaymentsView size="x-small" :invoice="lineCreditNote.invoice" />
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

                  <div v-if="false">
                    <v-btn
                      v-if="!isPaid"
                      size="small"
                      color="blue"
                      @click="() => checkUserAndExecute(lineCreditNote.created_by, toggleEditNotes)"
                      >{{ isEditingNotes ? 'Cancel' : 'Edit Notes' }}</v-btn
                    >
                  </div>

                  <!-- Textarea and Save Button -->
                  <div v-if="isEditingNotes">
                    <v-textarea v-model="lineCreditNote.description" :rows="3" placeholder="Enter your notes here..." />
                    <v-btn color="purple" @click="saveNotes">Save changes</v-btn>
                  </div>
                </v-alert>
              </v-card-text>
            </v-card>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 mb-4">
          <div class="text-lg font-bold">Linked Line Invoice #{{ lineInvoice.id }}</div>
          <div>Linked references</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="font-bold">ID</th>
                <th class="font-bold">Reference #</th>
                <th class="font-bold">Master BL</th>
                <th class="font-bold">Type</th>
                <th class="font-bold">Amount</th>
                <th class="font-bold">Payment(s)</th>
                <th class="font-bold">Payment status</th>
                <th class="font-bold">Created at</th>
                <th class="font-bold">User</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(lineInvRef, index) in lineInvoice.refs" :key="`line-inv-ref-${index}`">
                <td>{{ lineInvRef.id }}</td>
                <td>{{ lineInvRef.referencia?.reference_number }}</td>
                <td>{{ lineInvRef.master_bl?.name }}</td>
                <td>{{ lineInvRef.tm_wm }}</td>
                <td>{{ formatToCurrency(lineInvRef.amount) }}</td>
                <td>
                  <div
                    v-for="(charge, idx) in lineInvRef.invoice?.charges"
                    :key="`line-inv-ref-${index}-charge-${idx}`"
                  >
                    <div v-for="(payment, idx2) in charge.payments" :key="`payment-${index}`">
                      <v-chip color="blue" text-color="white" @click="viewPayment(payment)" class="mb-1"
                        ><v-icon>mdi-eye-outline</v-icon>{{ getPaymentTypeName(payment) }} #{{
                          payment.paymentable_id
                        }}
                        {{ formatToCurrency(payment.amount) }}</v-chip
                      >
                    </div>
                  </div>
                </td>
                <td>
                  <v-chip color="green" text-color="white" v-if="isPaidLineInvRef(lineInvRef)">Paid</v-chip>
                  <v-chip color="red" text-color="white" v-else>Pending</v-chip>
                </td>
                <td>{{ formatDateString(lineInvRef.created_at) }}</td>
                <td>{{ lineInvRef.creator?.name }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
        <div class="grid grid-cols-1 gap-4 mb-4">
          <div class="text-lg font-bold">Payments with Credit Note</div>
          <LineCreditNoteUseAsPayment :lineCreditNote="lineCreditNote" @refresh="getLineCreditNote" />
          <v-table density="compact">
            <thead>
              <tr>
                <th>Line Invoice #</th>
                <th>Payment ID</th>
                <th>Amount</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in lineCreditNote.payments" :key="payment.id">
                <td class="whitespace-nowrap">
                  <v-chip
                    color="primary"
                    density="compact"
                    class="cursor-pointer"
                    @click="viewLineInvoice(payment.chargeable?.invoice?.invoiceable?.line_invoice_id)"
                  >
                    <div class="flex items-center gap-2">
                      <v-icon>mdi-eye-outline</v-icon>
                      #{{ payment.chargeable?.invoice?.invoiceable?.line_invoice_id }}
                    </div>
                  </v-chip>
                </td>
                <td>#{{ payment.id }}</td>
                <td>{{ formatToCurrency(payment.amount) }}</td>
                <td>
                  <UserInfoBadge :item="payment">
                    {{ formatDateString(payment.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="editFolioForm.showDialog" max-width="500">
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Update Credit Note Folio</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model="lineCreditNote.folio_real"
            label="Folio"
            density="compact"
            placeholder="Enter the folio"
          />
          <v-btn color="primary" @click="updateFolio">Update</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { paymentableName } from '~/utils/data/morphNames'
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

const lineCreditNote = ref<any>({
  bank: '',
  beneficiary_name: '',
  account_number: '',
  aba: '',
  swift: '',
  iban: '',
})

const isEditingNotes = ref(false)

const editFolioForm = reactive({
  showDialog: false,
})

const showDialog = () => {
  editFolioForm.showDialog = true
}

const closeDialog = () => {
  editFolioForm.showDialog = false
}

const lineInvoice = computed(() => {
  return lineCreditNote.value.line_invoice
})

const isPaid = computed(() => {
  return lineCreditNote.value.invoice?.is_paid === 1
})

const formattedNotes = computed(() => {
  if (!lineCreditNote.value?.description) {
    return 'Empty notes'
  }
  return lineCreditNote.value.description.replace(/\n/g, '<br>')
})

const toggleEditNotes = () => {
  isEditingNotes.value = !isEditingNotes.value
}

const getPaymentTypeName = (payment: any) => {
  return paymentableName(payment)
}

const viewLineInvoice = (lineInvoiceId: any) => {
  router.push(`/invoices/lines/notes/view-${lineInvoiceId}`)
}

const viewPayment = (payment: any) => {
  console.log('payment', payment)
  if (payment.paymentable_type.includes('BankMovement')) {
    router.push(`/transfers/global/view-${payment.paymentable_id}?focusPayable=${payment.id}`)
    return
  }

  snackbar.add({ type: 'error', text: 'Unknown payment type' })
}

const isPaidLineInvRef = (lineInvRef: any) => {
  return lineInvRef.invoice?.is_paid === 1
}

const saveNotes = () => {
  console.log('pending')
}

// const saveNotes = async () => {
//   try {
//     loadingStore.start()
//     await $api.lineCreditNotes.updateNotes(props.id.toString(), { notes: lineCreditNote.value.notes })
//     snackbar.add({ type: 'success', text: 'Notes updated' })
//     isEditingNotes.value = false
//   } catch (e) {
//     console.error(e)
//   } finally {
//     setTimeout(() => {
//       loadingStore.stop()
//     }, 250)
//   }
// }

const updateFolio = async () => {
  try {
    loadingStore.start()
    const body = {
      folio: lineCreditNote.value.folio_real,
    }
    const response = await $api.lineCreditNotes.updateFolio(props.id.toString(), body)

    snackbar.add({ type: 'success', text: 'Folio updated' })
    editFolioForm.showDialog = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getLineCreditNote = async () => {
  try {
    loadingStore.start()
    const response = await $api.lineCreditNotes.getById(props.id.toString())

    lineCreditNote.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getLineCreditNote()
</script>
