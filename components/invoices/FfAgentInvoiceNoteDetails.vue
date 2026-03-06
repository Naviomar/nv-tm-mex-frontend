<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
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
            <div v-if="!isRefLinked" class="mb-4">
              <v-alert type="warning" variant="tonal" density="compact">
                <div class="font-semibold">No service linked</div>
              </v-alert>
            </div>

            <!-- Reference & Agent Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <v-card variant="tonal" :color="ffNote.inbound === 1 ? 'indigo' : 'cyan'">
                <v-card-text>
                  <div class="flex items-start gap-3">
                    <v-icon size="32" :color="ffNote.inbound === 1 ? 'indigo-darken-2' : 'cyan-darken-2'">mdi-truck-delivery</v-icon>
                    <div class="flex-1">
                      <div class="text-xs font-semibold mb-1" :class="ffNote.inbound === 1 ? 'text-indigo-darken-1' : 'text-cyan-darken-1'">FREIGHT FORWARDER</div>
                      <div class="font-bold text-base">{{ ffNote.forwarder?.name }}</div>
                      <div class="text-sm mt-1">
                        <span class="text-grey-darken-1">{{ ffNote.inbound === 1 ? 'From Agent' : 'From TM' }}</span>
                      </div>
                      <div v-if="isRefLinked" class="mt-2">
                        <div class="text-xs text-grey-darken-1">Reference</div>
                        <div class="font-semibold">{{ ffNote.serviceable?.reference_number }}</div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <v-card variant="tonal" :color="ffNote.type === 'C' ? 'green' : 'red'">
                <v-card-text>
                  <div class="flex items-start gap-3">
                    <v-icon size="32" :color="ffNote.type === 'C' ? 'green-darken-2' : 'red-darken-2'">{{ ffNote.type === 'C' ? 'mdi-cash-plus' : 'mdi-cash-minus' }}</v-icon>
                    <div class="flex-1">
                      <div class="text-xs font-semibold mb-1" :class="ffNote.type === 'C' ? 'text-green-darken-1' : 'text-red-darken-1'">{{ ffNote.type === 'C' ? 'CREDIT NOTE' : 'DEBIT NOTE' }}</div>
                      <div class="font-bold text-xl">{{ formatToCurrency(ffNote.amount_total) }} {{ ffNote.currency?.code }}</div>
                      <div v-if="ffNote.exchange_rate != 1" class="text-sm mt-1">
                        <span class="text-grey-darken-1">Exchange Rate:</span> {{ formatToCurrency(1 / ffNote.exchange_rate) }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- System Info Card -->
            <v-card variant="tonal" color="grey" class="mb-4">
              <v-card-text>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div class="text-xs text-grey-darken-1 mb-1">System ID</div>
                    <div class="font-semibold">{{ ffNote.id }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-grey-darken-1 mb-1">Created by</div>
                    <div class="font-semibold">{{ ffNote.creator?.name }}</div>
                    <div class="text-xs">{{ formatDateString(ffNote.created_at) }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Additional Notes -->
            <v-card v-if="ffNote.notes" variant="tonal" color="amber" class="mb-4">
              <v-card-text>
                <div class="flex items-start gap-3">
                  <v-icon color="amber-darken-2">mdi-note-text</v-icon>
                  <div class="flex-1">
                    <div class="text-xs text-amber-darken-1 font-semibold mb-1">ADDITIONAL NOTES</div>
                    <div class="font-medium">{{ ffNote.notes }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-divider class="my-4"></v-divider>
            <div class="flex flex-col sm:flex-row justify-around gap-2 mb-2">
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
