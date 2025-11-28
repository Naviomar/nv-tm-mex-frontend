<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="grid grid-cols-2">
              <div>
                <div class="font-bold">Agent F.F. Note #{{ ffNote.service_folio }}</div>
                <div>
                  <v-chip
                    :color="isPaid ? 'green' : 'warning'"
                    text-color="white"
                    small
                    class="capitalize"
                    v-if="!isCancelled"
                  >
                    {{ isPaid ? 'Paid' : 'Payment pending' }}
                  </v-chip>
                </div>
              </div>
              <div class="flex justify-end">
                <div v-if="ffNote.checked_at">
                  <v-btn density="compact" color="green" variant="outlined" icon="mdi-lock-outline"></v-btn>
                </div>
                <div v-if="!ffNote.checked_at">
                  <v-btn size="x-small" color="warning" variant="outlined" icon="mdi-lock-open-outline"></v-btn>
                </div>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="!isRefLinked" class="grid grid-cols-2">
              <v-alert type="warning" variant="outlined" density="compact" class="font-bold py-0!"
                >No service linked</v-alert
              >
            </div>
            <div class="grid grid-cols-[auto_1fr] space-x-4">
              <div v-if="isRefLinked" class="font-bold">Reference #</div>
              <div v-if="isRefLinked" class="font-bold">{{ ffNote.serviceable?.reference_number }}</div>
              <div>SystemId</div>
              <div>{{ ffNote.id }}</div>
              <div>From</div>
              <div>{{ ffNote.inbound === 1 ? 'From agent' : 'From TM' }}</div>
              <div>Type</div>
              <div>{{ ffNote.type === 'C' ? 'Credit' : 'Debit' }}</div>

              <div>F.F. Agent</div>
              <div>{{ ffNote.forwarder?.name }}</div>

              <div><v-divider class="mb-2"></v-divider></div>
              <div></div>

              <div>Total amount</div>
              <div>{{ formatToCurrency(ffNote.amount_total) }} {{ ffNote.currency?.code }}</div>

              <div v-if="ffNote.exchange_rate != 1">USD Exchange rate</div>
              <div v-if="ffNote.exchange_rate != 1">{{ formatToCurrency(1 / ffNote.exchange_rate) }}</div>

              <div><v-divider class="my-2"></v-divider></div>
              <div></div>

              <div>Created by</div>
              <div>{{ ffNote.creator?.name }}</div>
              <div>@</div>
              <div>{{ formatDateString(ffNote.created_at) }}</div>

              <div>Additional notes:</div>
              <div>{{ ffNote.notes }}</div>
            </div>
            <div class="flex justify-around gap-2 mb-2">
              <div v-if="ffNote.inbound === 0">
                <v-btn size="small" variant="tonal" @click="previewTmFfNotePdf(ffNote)"
                  ><v-icon>mdi-printer-eye</v-icon>PDF</v-btn
                >
              </div>
              <ButtonDownloadS3Object v-if="isFileString(ffNote.attachment)" :s3Path="ffNote.attachment" />
            </div>
            <v-alert v-if="isCancelled" density="compact" type="error" elevation="2">
              <div>This invoice has been cancelled at {{ formatDateString(ffNote.deleted_at) }}</div>
              <div>Reason: {{ ffNote.cancelled_reason }}</div>
              <div>Cancelled by: {{ ffNote.cancel_by?.name }}</div>
            </v-alert>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card v-if="isRefLinked" class="mb-4">
          <v-card-title
            ><div class="font-bold">Linked reference #{{ ffNote.serviceable?.reference_number }}</div></v-card-title
          >
          <v-card-text>
            <v-btn
              v-if="false"
              color="primary"
              size="small"
              :to="`/maritime/import/service-details-${ffNote.referencia?.id}`"
              ><v-icon>mdi-open-in-new</v-icon>View reference details</v-btn
            >
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title><div class="font-bold">Request Payment details</div></v-card-title>
          <v-card-text>
            <v-alert type="warning" elevation="2" density="compact" v-if="!ffNote.note_payment">
              <div>Pending to request payment via SOA.</div>
            </v-alert>
            <v-alert type="info" elevation="2" variant="tonal" density="compact" v-if="ffNote.note_payment">
              <div class="font-bold mb-4">
                Payment requested at {{ formatDateString(ffNote.note_payment?.created_at) }}
              </div>
              <div v-if="ffNote.note_payment?.payment?.invoice?.is_paid == 0">
                <v-chip color="orange" size="small">Pending payment</v-chip>
              </div>
              <div v-if="ffNote.note_payment?.payment?.invoice?.is_paid == 1">
                <v-chip color="success" size="small"
                  >Paid @ {{ formatDateString(ffNote.note_payment?.payment?.invoice?.updated_at) }}</v-chip
                >
              </div>
              <div class="py-4">
                <v-btn
                  color="amber"
                  size="small"
                  :to="`/payments/agents/payments/view-${ffNote.note_payment?.ff_payment_id}?ff_note_id=${ffNote.id}`"
                  ><v-icon>mdi-open-in-new</v-icon>View payment request details</v-btn
                >
              </div>
            </v-alert>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-span-2">
        <v-card v-if="true" color="blue-lighten-4" class="mb-4">
          <v-card-title><div class="font-bold">Invoice detail</div></v-card-title>
          <v-card-text>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-bold! w-5">#</th>
                  <th class="font-bold!">Concept</th>
                  <th class="font-bold!">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(concept, idx) in ffNote.concepts" :key="`ff-note-concept-${idx}`">
                  <td>{{ concept.id }}</td>
                  <td>
                    {{ concept.charge?.name }}
                  </td>
                  <td>{{ getCurrencyName(concept.currency_id) }} {{ formatToCurrency(concept.amount) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </div>
    </div>
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
const loadingStore = useLoadingStore()
const pdfServerViewer = ref<any>(null)
const showPdfDialog = ref(false)

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const ffNote = ref<any>({})

const isCancelled = computed(() => {
  return ffNote.value?.cancelled_at != null
})

const isRefLinked = computed(() => {
  return ffNote.value?.serviceable != null
})

const isPaid = computed(() => {
  if (!ffNote.value?.invoice) {
    return false
  }
  return ffNote.value?.invoice.is_paid === 1
})

const isFileString = (file: any) => {
  if (!file) return false
  // check if is a string
  return typeof file === 'string'
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

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.freightForwarders.getFfNoteById(props.id)

    ffNote.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()
</script>
