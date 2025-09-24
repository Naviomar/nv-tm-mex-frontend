<template>
  <div>
    <v-card density="compact" class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-credit-card-multiple-outline</v-icon>
            <div class="ml-2 font-bold">Credit / Debit Note(s)</div>
          </div>
          <div>
            <v-btn icon size="x-small" @click="toggleForm" :color="showForm ? 'black' : 'success'">
              <v-icon v-if="showForm">mdi-close</v-icon>
              <v-icon v-if="!showForm">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div v-show="showForm">
          <div class="font-bold">Credit / Debit Form</div>
          <div>
            <InputAutocomplete
              name="format"
              density="compact"
              label="Select F.F. note type *"
              :items="[
                { value: '1', name: 'From agent' }, // no
                { value: '0', name: 'From TM' }, // yes
              ]"
              item-title="name"
              item-value="value"
              variant="solo-filled"
              @update:model-value="initForms"
            />
            <v-alert color="grey-ligten-2" density="compact">
              <strong>From agent</strong>: Credit / Debit note from agent to us. <strong>From TM</strong>: Credit /
              Debit note from us to agent.
            </v-alert>
          </div>
          <div class="py-5">
            <!-- From TM or Agent -->
            <div v-show="values.format != null">
              <div class="grid grid-cols-4 gap-3">
                <div>
                  <v-autocomplete
                    v-model="form.type"
                    density="compact"
                    label="Type *"
                    :items="[
                      { value: 'C', name: 'Credit' },
                      { value: 'D', name: 'Debit' },
                    ]"
                    item-title="name"
                    item-value="value"
                    variant="solo-filled"
                  />
                </div>
                <div>
                  <v-autocomplete
                    v-model="form.currency_id"
                    density="compact"
                    label="Currency *"
                    :items="currencies"
                    item-title="name"
                    item-value="id"
                    variant="solo-filled"
                  />
                </div>
                <div>
                  <AGlobalSearch
                    ref="ffSearchRef"
                    :onSearch="searchFfs"
                    v-model="form.agente_ff_id"
                    validate-key="agente_ff_id"
                    label="F.F. Agent *"
                    :set-items="ffItems"
                    :set-item="ffItem"
                    :set-id="values.agente_ff_id || undefined"
                  />
                </div>
                <div>
                  <v-text-field v-model="form.contacto_ff" density="compact" label="Contacto F.F." />
                </div>
                <div v-if="isFromAgent" class="col-span-2">
                  <v-text-field v-model="form.folio" density="compact" label="Folio *" />
                </div>
                <div class="col-span-1">
                  <v-switch
                    v-model="form.as_invoice"
                    :false-value="0"
                    :true-value="1"
                    color="green"
                    density="compact"
                    label="As invoice"
                  />
                </div>
                <div class="col-span-1">
                  <v-file-input
                    v-model="form.attachment"
                    :counter="true"
                    density="compact"
                    :multiple="false"
                    :show-size="false"
                    label="File"
                  />
                </div>
              </div>
              <div class="flex justify-start items-center gap-4 mb-2">
                <v-btn icon="mdi-plus" size="x-small" color="success" @click="addCharge"></v-btn>
                <div class="font-bold">Concepts</div>
                <v-btn v-if="isFromAgent" size="x-small" color="purple" @click="populateSellCharges"
                  >Add sell concepts from reference</v-btn
                >
              </div>

              <div v-for="(charge, index) in concepts" :key="`ff-concept-${index}`" class="grid grid-cols-5 gap-3">
                <div class="col-span-2">
                  <v-autocomplete
                    v-model="charge.charge_id"
                    density="compact"
                    label="Charge"
                    :items="props.charges"
                    item-title="name"
                    item-value="id"
                    variant="solo-filled"
                  />
                </div>
                <div class="">
                  <v-text-field
                    v-model="charge.amount"
                    density="compact"
                    variant="solo-filled"
                    label="Amount"
                    clearable
                    prepend-inner-icon="mdi-currency-usd"
                  />
                </div>

                <div class="">
                  <v-btn
                    color="red"
                    variant="outlined"
                    icon="mdi-delete-outline"
                    size="x-small"
                    @click="removeCharge(index)"
                  >
                  </v-btn>
                </div>
              </div>
              <div class="flex justify-end gap-4">
                <v-btn color="red" @click="cancelForm"> Cancel </v-btn>
                <v-btn color="primary" @click="upsertFfNote">
                  {{ form.id ? `Update note #${form.id}` : 'Add note' }}
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <v-table density="compact">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Type</th>
              <th>Credit/Debit</th>
              <th>Folio</th>
              <th>Agente F.F.</th>
              <th>Amount</th>
              <th>in USD</th>
              <th>File / PDF</th>
              <th>Status</th>
              <th>Req. payment status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(creditDebit, index) in referenciaCreditDebitNotes"
              :key="`ref-creditDebit-${index}`"
              :class="colorRow(creditDebit)"
            >
              <td>
                <div v-if="creditDebit.deleted_at == null && !creditDebit.note_payment" class="flex items-center gap-2">
                  <div v-if="!creditDebit.checked_at">
                    <EditButton :item="creditDebit" @click="editFfNote(creditDebit)" />
                  </div>
                  <div v-if="creditDebit.checked_at">
                    <v-btn density="compact" color="green" icon="mdi-lock-outline"></v-btn>
                  </div>
                  <div v-if="!creditDebit.checked_at">
                    <v-btn
                      size="x-small"
                      color="blue-lighten-4"
                      icon="mdi-lock-open-outline"
                      @click="toggleLock(creditDebit)"
                    ></v-btn>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap">{{ getFormatName(creditDebit.format) }}</td>
              <td>
                <div>{{ getTypeName(creditDebit.type) }}</div>
                <div v-if="creditDebit.as_invoice === 1">
                  <v-chip color="purple" size="x-small">As invoice</v-chip>
                </div>
              </td>
              <td class="whitespace-nowrap">{{ creditDebit.service_folio }}</td>
              <td class="whitespace-nowrap">{{ creditDebit.forwarder?.name }}</td>
              <td class="whitespace-nowrap">
                <div class="flex gap-2 items-center">
                  <v-btn
                    v-if="!creditDebit.deleted_at"
                    icon
                    size="x-small"
                    color="purple"
                    @click="onClickShowFfNoteDetails(creditDebit)"
                  >
                    <v-icon>mdi-format-list-checkbox</v-icon>
                  </v-btn>
                  {{ getCurrencyName(creditDebit.currency_id) }} {{ formatToCurrency(getTotalAmount(creditDebit)) }}
                </div>
              </td>
              <td class="whitespace-nowrap">
                <AmountConversionUSD :item="creditDebit" />
              </td>
              <td>
                <div v-if="creditDebit.inbound === 0">
                  <v-btn size="small" variant="tonal" @click="previewTmFfNotePdf(creditDebit)"
                    ><v-icon>mdi-printer-eye</v-icon>PDF</v-btn
                  >
                </div>
                <ButtonDownloadS3Object v-if="isFileString(creditDebit.attachment)" :s3Path="creditDebit.attachment" />
              </td>
              <td>
                <v-chip :color="creditDebit.deleted_at ? 'red' : 'green'" variant="elevated" size="small">
                  {{ creditDebit.deleted_at ? 'Cancelled' : 'Active' }}
                </v-chip>
              </td>
              <td>
                <v-chip v-if="!creditDebit.note_payment" size="small" color="orange"> Pending req. payment </v-chip>
                <v-chip
                  v-if="creditDebit.note_payment"
                  :color="creditDebit.note_payment.payment?.invoice?.is_paid == 1 ? 'green' : 'red'"
                  size="small"
                >
                  <div class="flex gap-2">
                    <v-icon @click="viewFfReqPayment(creditDebit.note_payment)">mdi-eye-outline</v-icon>
                    {{
                      creditDebit.note_payment.payment?.invoice?.is_paid == 1
                        ? `Paid F.F. Req #${creditDebit.note_payment.ff_payment_id}`
                        : `Pending payment #${creditDebit.note_payment.ff_payment_id}`
                    }}
                  </div>
                </v-chip>
                <InvoiceChargePaymentsView size="x-small" :invoice="creditDebit.note_payment?.payment?.invoice" />
              </td>
              <td class="whitespace-nowrap">
                <div v-if="!creditDebit.deleted_at && !creditDebit.checked_at">
                  <v-btn icon color="red" @click="confirmDelete(creditDebit)" size="x-small">
                    <v-icon>mdi-delete-outline</v-icon>
                  </v-btn>
                </div>
                <UserInfoBadge :item="creditDebit" />
                <div v-if="creditDebit.deleted_at">Reason: {{ creditDebit.cancelled_reason }}</div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="hasPendingToSave" color="primary" @click="saveFfNotes"> Add Credit / Debit Note(s) </v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="deleteNote.show">
      <v-card>
        <v-card-title>Cancel Credit / Debit Note</v-card-title>
        <v-card-text>
          <div>Are you sure you want to cancel this note?</div>
          <v-textarea v-model="deleteNote.comments" density="compact" rows="3" label="Comments about cancellation." />
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="deleteNote.show = false">Cancel</v-btn>
          <v-btn color="primary" @click="deleteNoteConfirm">Cancel note</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="lockNote.show" max-width="500">
      <v-card>
        <v-card-title>Confirm lock / unlock action</v-card-title>
        <v-card-text>
          <div>Are you sure you want to {{ lockNote.type }} note #{{ lockNote.creditDebit?.folio }}?</div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="lockNote.show = false">Cancel</v-btn>
          <v-btn color="primary" @click="confirmLockNote">{{ lockNote.type }} note</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
          <object ref="pdfServerViewer" type="application/pdf" width="100%" height="100%"></object>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="ffNoteDetails.show" max-width="800">
      <v-card>
        <v-card-title>
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-format-list-checkbox</v-icon>
            <span>F.F. Note #{{ ffNoteDetails.ffNote.service_folio }}</span>
          </div>
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Charge</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(charge, index) in ffNoteDetails.ffNote.concepts" :key="`ff-charge-${index}`">
                <td>{{ charge.charge.name }}</td>
                <td>{{ getCurrencyName(ffNoteDetails.ffNote.currency_id) }} {{ charge.amount }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td class="font-bold">Total</td>
                <td class="font-bold">
                  {{ getCurrencyName(ffNoteDetails.ffNote.currency_id) }}
                  {{ formatToCurrency(getTotalAmount(ffNoteDetails.ffNote)) }}
                </td>
              </tr>
            </tfoot>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="ffNoteDetails.show = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { schemaCreditDebitNotes } from '~~/forms/maritimeReferenceForm'
import { currencies } from '@/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  referenciaId: {
    type: [String, Number],
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
  charges: {
    type: Array,
    required: false,
  },
  freights: {
    type: Array,
    required: false,
  },
  initData: {
    type: Object,
    required: false,
  },
})

const emits = defineEmits(['requestSellCharges', 'refresh'])

const showForm = ref(true)
const toggleForm = () => (showForm.value = !showForm.value)
const pdfServerViewer = ref<any>(null)
const showPdfDialog = ref(false)
const ffNoteDetails = ref<any>({
  show: false,
  ffNote: null,
})

const creditDebitNotes = ref<any>([])
const referenciaCreditDebitNotes = ref<any>([])
const ffItems = ref<any>([])
const ffItem = ref<any>(null)
const ffSearchRef = ref<any>(null)

const deleteNote = ref<any>({
  show: false,
  creditDebit: null,
  comments: null,
})

const lockNote = ref<any>({
  show: false,
  creditDebit: null,
  type: null,
})

const form = ref<any>({
  type: null,
  folio: null,
  as_invoice: false,
  agente_ff_id: null,
  contacto_ff: null,
  amount: 0,
  currency_id: null,
  attachment: null as any,
})

const concepts = ref<any>([])

const { handleSubmit, values, errors, meta, handleReset, validate, setValues } = useForm({
  validationSchema: schemaCreditDebitNotes,
})

const hasPendingToSave = computed(() => creditDebitNotes.value.length > 0)

const isFileArray = (file: any) => {
  if (!file) return false
  // check if is an array of files
  return Array.isArray(file)
}

const isFileString = (file: any) => {
  if (!file) return false
  // check if is a string
  return typeof file === 'string'
}

const addCharge = () => {
  concepts.value.push({
    charge_id: null,
    amount: 0,
  })
}

const removeCharge = (index: number) => {
  concepts.value.splice(index, 1)
}

const onClickShowFfNoteDetails = (creditDebit: any) => {
  ffNoteDetails.value.ffNote = creditDebit
  ffNoteDetails.value.show = true
}

const colorRow = (creditDebit: any) => {
  return {
    'dark:hover:bg-gray-700 hover:bg-slate-300': true,
    'bg-red-100! dark:bg-red-900!': creditDebit.deleted_at,
  }
}

const populateSellCharges = () => {
  emits('requestSellCharges', (charges: any) => {
    concepts.value = (charges ?? []).map((charge: any) => ({
      charge_id: charge.charge_id,
      amount: charge.amount_total,
    }))
  })
}

const getTypeName = (type: string) => {
  if (type === 'Debit' || type === 'D') {
    return 'Debit'
  }
  if (type === 'Credit' || type === 'C') {
    return 'Credit'
  }
  return 'Unknown'
}

const isFromAgent = computed(() => values.format === '1')

const getFormatName = (format: string) => {
  return format === '0' ? 'From TM' : 'From Agent'
}

const getTotalAmount = (creditDebit: any) => {
  let total = 0
  creditDebit.concepts.forEach((charge: any) => {
    total += parseFloat(charge.amount)
  })
  return total
}

const searchFfs = async (params: any) => {
  try {
    const response = await $api.freightForwarders.searchFfs({
      query: params,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching freight forwarder agents.',
    })
  }
}

const initForms = async () => {
  form.value = {
    type: null,
    folio: null,
    agente_ff_id: null,
    contacto_ff: null,
    amount: 0,
    currency_id: null,
    attachment: null,
  }
  concepts.value = [
    {
      charge_id: null,
      amount: 0,
    },
  ]
}

const validateForm = async () => {
  const isValid = await validate()
  if (!isValid) {
    return false
  }
  if (!form.value.type || !form.value.agente_ff_id || !form.value.currency_id) {
    snackbar.add({
      type: 'warning',
      text: 'You must fill all fields',
    })
    return false
  }
  if (concepts.value.length === 0) {
    snackbar.add({
      type: 'warning',
      text: 'You must add at least one charge',
    })
    return false
  }
  // for each charge validate if all fields are filled
  let validCharges = true
  concepts.value.forEach((charge: any) => {
    if (!charge.charge_id || !charge.amount) {
      snackbar.add({
        type: 'warning',
        text: 'You must fill all fields',
      })
      validCharges = false
    }
  })
  if (!validCharges) {
    return false
  }
  if (values.format === '1') {
    if (!form.value.folio) {
      snackbar.add({
        type: 'warning',
        text: 'You must fill all fields',
      })
      return false
    }
  }

  return true
}

const cancelForm = () => {
  setValues({ format: undefined })
  concepts.value = []
  form.value = {
    type: null,
    folio: null,
    agente_ff_id: null,
    contacto_ff: null,
    amount: 0,
    currency_id: null,
    attachment: null,
  }
  toggleForm()
}

const upsertFfNote = async () => {
  const isValidForm = await validateForm()
  if (!isValidForm) {
    return
  }
  creditDebitNotes.value.push({
    format: values.format,
    ...form.value,
    concepts: concepts.value,
  })
  setValues({ format: undefined })
  concepts.value = []
  form.value = {
    id: null,
    type: null,
    folio: null,
    agente_ff_id: null,
    contacto_ff: null,
    amount: 0,
    currency_id: null,
    attachment: null,
  }

  await saveFfNotes()
  toggleForm()
}

const editFfNote = async (creditDebit: any) => {
  const ffs = await searchFfs({ name: creditDebit.forwarder.name })
  ffItems.value = ffs

  ffSearchRef.value?.setItems(ffs)
  ffSearchRef.value?.setItem(creditDebit.forwarder_id)

  setValues({ format: creditDebit.format })

  form.value = {
    id: creditDebit.id,
    type: creditDebit.type,
    folio: creditDebit.folio,
    as_invoice: creditDebit.as_invoice,
    agente_ff_id: creditDebit.forwarder_id,
    contacto_ff: creditDebit.contact_name,
    amount: creditDebit.amount,
    currency_id: creditDebit.currency_id,
    attachment: creditDebit.attachment,
  }

  concepts.value = creditDebit.concepts

  deleteNote.value = {
    show: false,
    creditDebit: null,
    comments: null,
  }
  lockNote.value = {
    show: false,
    creditDebit: null,
    type: null,
  }

  toggleForm()
}

const confirmDelete = async (creditDebit: any) => {
  deleteNote.value.creditDebit = creditDebit
  deleteNote.value.show = true
}

const toggleLock = async (creditDebit: any) => {
  lockNote.value.creditDebit = creditDebit
  lockNote.value.type = creditDebit.checked_at ? 'unlock' : 'lock'
  lockNote.value.show = true
}

const viewFfReqPayment = (notePayment: any) => {
  router.push(`/payments/agents/payments/view-${notePayment.ff_payment_id}`)
}

const previewTmFfNotePdf = async (creditDebit: any) => {
  try {
    showPdfDialog.value = true
    loadingStore.start()
    const response = await $api.ffNotes.getFfNotePdf(creditDebit.id)
    const blob = new Blob([response as any], { type: 'application/pdf' })
    const pdfUrl = URL.createObjectURL(blob)
    if (pdfServerViewer.value == null) {
      pdfServerViewer.value = document.createElement('object')
    }
    pdfServerViewer.value.data = pdfUrl
  } catch (e) {
    console.error(e)
    showPdfDialog.value = false
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
const closePdfDialog = () => {
  showPdfDialog.value = false
  pdfServerViewer.value = null
}

const confirmLockNote = async () => {
  try {
    loadingStore.start()
    const response = await $api.ffNotes.toggleLockFreightNote(lockNote.value.creditDebit.id)
    snackbar.add({
      type: 'success',
      text: 'Agent freight forwarder note locked / unlocked',
    })
    lockNote.value = {
      show: false,
      creditDebit: null,
      type: null,
    }
    fetchServiceFfNotes()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const deleteNoteConfirm = async () => {
  try {
    if (deleteNote.value.comments === null || deleteNote.value.comments === '') {
      snackbar.add({ type: 'warning', text: 'You must add a comment' })
      return
    }
    loadingStore.start()
    const body = {
      creditNote: deleteNote.value.creditDebit,
      comments: deleteNote.value.comments,
    }
    const response = await $api.ffNotes.deleteFfNote(body)
    snackbar.add({
      type: 'success',
      text: 'Agent freight forwarder note deleted',
    })
    deleteNote.value = {
      show: false,
      creditDebit: null,
      comments: null,
    }
    fetchServiceFfNotes()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveFfNotes = async () => {
  try {
    if (creditDebitNotes.value.length === 0) {
      snackbar.add({
        type: 'warning',
        text: 'You must add at least one note',
      })
      return
    }

    loadingStore.start()
    const body = {
      credit_debit_notes: creditDebitNotes.value,
      service_id: props.referenciaId,
      service_type: props.serviceType,
    }
    const response = await $api.ffNotes.saveFfNotes(body)
    snackbar.add({
      type: 'success',
      text: 'F.F. Agent - Credit / Debit note saved',
    })
    creditDebitNotes.value = []
    emits('refresh')
  } catch (e: any) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
    fetchServiceFfNotes()
  }
}

const fetchServiceFfNotes = async () => {
  try {
    loadingStore.start()
    const body = {
      service_id: props.referenciaId,
      service_type: props.serviceType,
    }
    const response = await $api.ffNotes.getFfNoteByService(body)
    referenciaCreditDebitNotes.value = response

    referenciaCreditDebitNotes.value = referenciaCreditDebitNotes.value.map((item: any) => ({
      ...item,
      format: item.inbound === 0 ? '0' : '1',
      type: item.type === 'D' ? 'Debit' : 'Credit',
    }))
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await fetchServiceFfNotes()
})
</script>
