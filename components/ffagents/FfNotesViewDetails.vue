<template>
  <div>
    <v-table density="compact">
      <thead>
        <tr>
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
        <tr v-if="ffNotes.length === 0">
          <td colspan="10" class="text-center">No F.F. Agent Notes found</td>
        </tr>
        <tr v-for="(ffNote, index) in ffNotes" :key="`ff-note-${index}`" :class="colorRow(ffNote)">
          <td class="whitespace-nowrap">{{ getFormatName(ffNote.format) }}</td>
          <td>
            <div>{{ getTypeName(ffNote.type) }}</div>
            <div v-if="ffNote.as_invoice === 1">
              <v-chip color="purple" size="x-small">As invoice</v-chip>
            </div>
          </td>
          <td class="whitespace-nowrap">{{ ffNote.service_folio }}</td>
          <td class="whitespace-nowrap">{{ ffNote.forwarder?.name }}</td>
          <td class="whitespace-nowrap">
            <div class="flex gap-2 items-center">
              <v-btn
                v-if="!ffNote.deleted_at"
                icon
                size="x-small"
                color="purple"
                @click="onClickShowFfNoteDetails(ffNote)"
              >
                <v-icon>mdi-format-list-checkbox</v-icon>
              </v-btn>
              {{ getCurrencyName(ffNote.currency_id) }} {{ formatToCurrency(getTotalAmount(ffNote)) }}
            </div>
          </td>
          <td class="whitespace-nowrap">
            <AmountConversionUSD :item="ffNote" />
          </td>
          <td>
            <div v-if="ffNote.inbound === 0">
              <v-btn size="small" variant="tonal" @click="previewTmFfNotePdf(ffNote)"
                ><v-icon>mdi-printer-eye</v-icon>PDF</v-btn
              >
            </div>
            <ButtonDownloadS3Object v-if="isFileString(ffNote.attachment)" :s3Path="ffNote.attachment" />
          </td>
          <td>
            <v-chip :color="ffNote.deleted_at ? 'red' : 'green'" variant="elevated" size="small">
              {{ ffNote.deleted_at ? 'Cancelled' : 'Active' }}
            </v-chip>
          </td>
          <td>
            <v-chip v-if="!ffNote.note_payment" size="small" color="orange"> Pending req. payment </v-chip>
            <v-chip
              v-if="ffNote.note_payment"
              :color="ffNote.note_payment.payment?.invoice?.is_paid == 1 ? 'green' : 'red'"
              size="small"
            >
              <div class="flex gap-2">
                <v-icon @click="viewFfReqPayment(ffNote.note_payment)">mdi-eye-outline</v-icon>
                {{
                  ffNote.note_payment.payment?.invoice?.is_paid == 1
                    ? `Paid Req #${ffNote.note_payment.ff_payment_id}`
                    : `Pending payment #${ffNote.note_payment.ff_payment_id}`
                }}
              </div>
            </v-chip>
          </td>
          <td class="whitespace-nowrap">
            <UserInfoBadge :item="ffNote" />
            <div v-if="ffNote.deleted_at">Reason: {{ ffNote.cancelled_reason }}</div>
          </td>
        </tr>
      </tbody>
    </v-table>

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
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  ffNotes: {
    type: Array as any,
    required: true,
    default: () => [],
  },
})

onMounted(() => {
  console.log(
    'FFNotesViewDetails - payment invoice is_paid status:',
    props.ffNotes?.map((note: any) => ({
      id: note.id,
      ff_payment_id: note.note_payment?.ff_payment_id,
      is_paid: note.note_payment?.payment?.invoice?.is_paid,
      invoice_id: note.note_payment?.id,
    })),
  )
})

const pdfServerViewer = ref<any>(null)
const showPdfDialog = ref(false)
const ffNoteDetails = ref<any>({
  show: false,
  ffNote: null,
})

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

const colorRow = (creditDebit: any) => {
  return {
    'dark:hover:bg-gray-700 hover:bg-slate-300': true,
    'bg-red-100! dark:bg-red-900!': creditDebit.deleted_at,
  }
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

const isFileString = (file: any) => {
  if (!file) return false
  // check if is a string
  return typeof file === 'string'
}

const viewFfReqPayment = (notePayment: any) => {
  router.push(`/payments/agents/payments/view-${notePayment.ff_payment_id}`)
}

const onClickShowFfNoteDetails = (creditDebit: any) => {
  ffNoteDetails.value.ffNote = creditDebit
  ffNoteDetails.value.show = true
}

const closePdfDialog = () => {
  showPdfDialog.value = false
  pdfServerViewer.value = null
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
</script>
