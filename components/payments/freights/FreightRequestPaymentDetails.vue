<template>
  <div>
    <v-card>
      <v-card-title> Request payment #{{ props.id }} - Freight forwarder notes </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-2 mb-4">
          <div>
            <div class="grid grid-cols-2 gap-2">
              <div>Freight forwarder Agent</div>
              <div>{{ ffPayment.forwarderable?.name }} {{ getForwarderableType }}</div>
              <div>Requested by</div>
              <div>{{ ffPayment.creator?.name }}</div>
              <div>Requested at</div>
              <div>{{ formatDateString(ffPayment.created_at) }}</div>
              <div># linked F. F. Notes</div>
              <div>{{ ffPayment.note_payments?.length }}</div>
              <div class="col-span-2">
                <div class="flex gap-4">
                  <v-btn color="amber" size="small" variant="tonal" @click="downloadFfPaymentPdf(ffPayment)"
                    ><v-icon>mdi-cloud-download</v-icon> PDF
                  </v-btn>
                  <v-btn color="amber" size="small" variant="tonal" @click="downloadFfPaymentExel(ffPayment)"
                    ><v-icon>mdi-cloud-download</v-icon> Excel
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="grid grid-cols-2 gap-2">
              <div>Total balance due to</div>
              <div>{{ balanceTo }}</div>
              <div>Amount</div>
              <div>{{ getCurrencyName(ffPayment.currency_id) }} {{ formatToCurrency(ffPayment.amount) }}</div>
              <div>Notification sent?</div>
              <div>
                <v-chip size="small" color="primary" text-color="white" v-if="ffPayment.sent_at">
                  Sent by {{ ffPayment.sent_by }} @ {{ formatDateString(ffPayment.sent_at) }}
                </v-chip>
                <v-chip size="small" color="warning" text-color="white" v-else> Not sent </v-chip>
              </div>
              <div>Payment status</div>
              <div>
                <v-chip size="small" :color="ffPayment.invoice?.is_paid == 1 ? 'green' : 'red'">{{
                  ffPayment.invoice?.is_paid == 1 ? 'Paid' : 'Unpaid'
                }}</v-chip>
              </div>
            </div>
          </div>
        </div>

        <div class="font-bold text-base">Freight forwarder notes linked</div>
        <FreightRequestAddFfNote :ffPayment="ffPayment" @addNote="addNoteToReqPayment" />

        <div class="flex gap-2 my-4">
          <v-btn color="primary" size="small" variant="tonal" @click="checkAll"> Check all </v-btn>
          <v-btn color="primary" size="small" variant="tonal" @click="uncheckAll"> Uncheck all </v-btn>

          <div v-if="hasSplitChecked">
            <v-btn color="primary" size="small" @click="showConfirmSplit">Split selected notes</v-btn>
          </div>
        </div>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Actions</th>
              <th class="text-left">Split</th>
              <th class="text-left">D/C Note #</th>
              <th class="text-left">Service Ref #</th>
              <th class="text-left">F.F. Agent</th>
              <th class="text-left">Type D/C</th>
              <th class="text-left">Amount</th>
              <th class="text-left">Amount USD</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <!-- TODO Ver como en balance -->
            <tr
              v-for="(notePayment, index) in ffPayment.note_payments"
              :key="`notePayment-${index}`"
              :id="`ff-note-${notePayment.ff_note.id}`"
            >
              <td>
                <div class="flex items-center gap-2 mb-2">
                  <ViewButton :item="notePayment" @click="viewFfNote(notePayment)" />
                  <TrashButton :item="notePayment" @click="showConfirmDelete(notePayment)" />
                </div>
                <div>
                  <v-btn color="purple" size="x-small" @click="showFfNoteNotes(notePayment)"
                    ><v-icon>mdi-note-edit-outline</v-icon> Notes
                  </v-btn>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <v-checkbox v-model="notePayment.checked_split" density="compact" hide-details> Split </v-checkbox>
              </td>
              <td>
                <div class="flex flex-col items-center justify-center gap-1">
                  <div class="whitespace-nowrap text-base font-bold">{{ notePayment.ff_note?.folio }}</div>
                  <div v-if="notePayment.ff_note.notes">
                    <v-chip size="small" color="primary">
                      <v-icon>mdi-note-outline</v-icon>{{ notePayment.ff_note.notes }}
                    </v-chip>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <div v-if="notePayment.ff_note?.serviceable">
                  {{ notePayment.ff_note?.serviceable?.reference_number }}
                </div>
                <div v-if="!notePayment.ff_note?.serviceable">No link</div>
              </td>
              <td>{{ notePayment.ff_note?.forwarder?.name }}</td>
              <td>
                {{ notePayment.ff_note?.type === 'D' ? 'Debit' : 'Credit' }} -
                {{ notePayment.ff_note?.inbound === 0 ? 'From TM' : 'From Agent' }}
              </td>
              <td class="whitespace-nowrap">{{ formatToCurrency(notePayment.ff_note?.signed_amount) }}</td>
              <td class="whitespace-nowrap">
                <AmountConversionUSD :item="notePayment.ff_note" />
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="notePayment">
                  {{ formatDateString(notePayment.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>

      </v-card-text>
    </v-card>
    <v-dialog v-model="noteEdit.show" max-width="800">
      <v-card>
        <v-card-title>Notes for F.F. Note #{{ noteEdit.notePayment?.ff_note?.id }}</v-card-title>
        <v-card-text>
          <v-textarea v-model="noteEdit.notes" label="Notes" clearable density="compact" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveFfNoteNotes">Save</v-btn>
          <v-btn @click="closeFfNoteNotes">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmSplit.show" max-width="800">
      <v-card>
        <v-card-title>Split selected notes</v-card-title>
        <v-card-text>
          <div v-for="(notePayment, index) in selectedSplitFfNotes" :key="`split-${index}`">
            {{ notePayment.ff_note?.folio }} - {{ notePayment.ff_note?.forwarder?.name }} -
            {{ formatToCurrency(notePayment.ff_note?.amount) }} {{ getCurrencyName(notePayment.ff_note?.currency_id) }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="gray" variant="outlined" @click="closeConfirmSplit">Close</v-btn>
          <v-btn color="primary" @click="splitSelectedNotes">Split notes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const router = useRouter()
const route = useRoute()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const noteEdit = ref<any>({
  show: false,
  notePayment: null,
  notes: '',
})

const confirmSplit = ref<any>({
  show: false,
})

const ffPayment = ref<any>({})

const getForwarderableType = computed(() => {
  if (!ffPayment.value) return ''
  if (ffPayment.value.forwarderable?.class_name.includes('FreightGroup')) {
    return '(Group)'
  }
  return '(Agent)'
})

const balanceTo = computed(() => {
  if (!ffPayment.value) return ''
  // if ffPayment.amount is negative to F.F. Agent else Transporte Multimodal
  return parseFloat(ffPayment.value.amount) < 0 ? 'F.F. Agent' : 'Transporte Multimodal'
})

const hasSplitChecked = computed(() => {
  return ffPayment.value.note_payments?.some((notePayment: any) => notePayment.checked_split)
})

const selectedSplitFfNotes = computed(() => {
  return ffPayment.value.note_payments?.filter((notePayment: any) => notePayment.checked_split) || []
})

const showFfNoteNotes = (notePayment: any) => {
  noteEdit.value = {
    show: true,
    notePayment,
    notes: notePayment.ff_note?.notes,
  }
}

const closeFfNoteNotes = () => {
  noteEdit.value = {
    show: false,
    notePayment: null,
    notes: '',
  }
}

const showConfirmSplit = () => {
  // if all are selected is not possible to split
  if (selectedSplitFfNotes.value.length === ffPayment.value.note_payments?.length) {
    snackbar.add({ type: 'warning', text: 'You can not split all notes' })
    return
  }
  confirmSplit.value = {
    show: true,
  }
}

const closeConfirmSplit = () => {
  confirmSplit.value = {
    show: false,
  }
}

const checkAll = () => {
  ffPayment.value.note_payments?.forEach((note: any) => {
    note.checked_split = true
  })
}

const uncheckAll = () => {
  ffPayment.value.note_payments?.forEach((note: any) => {
    note.checked_split = false
  })
}

const viewFfNote = (notePayment: any) => {
  router.push(`/invoices/ffagents/notes/view-${notePayment.ff_note?.id}`)
}

const showConfirmDelete = async (notePayment: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, unlink this note',
    content: 'Please confirm you want to unlink this Freight Forwarder Note.',
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
      loadingStore.loading = true
      const body = {
        ff_note_payment_id: notePayment.id,
      }
      await $api.ffNotes.paymentUnlinkNoteByFfNotePaymentId(ffPayment.value.id, body)
      snackbar.add({ type: 'success', text: 'Note unlinked' })
      await getData()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const downloadFfPaymentPdf = async (ffpayment: any) => {
  try {
    loadingStore.loading = true
    const response = await $api.ffNotes.downloadFfPaymentPdf(ffPayment.value.id)
    const blob = new Blob([response], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    window.open(url)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const downloadFfPaymentExel = async (ffpayment: any) => {
  try {
    loadingStore.loading = true
    const response = await $api.ffNotes.downloadFfPaymentExel(ffPayment.value.id)
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    window.open(url)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const splitSelectedNotes = async () => {
  try {
    loadingStore.loading = true
    const body = {
      ff_payment_id: ffPayment.value.id,
      ff_notes: selectedSplitFfNotes.value.map((notePayment: any) => notePayment.ff_note.id),
      type: 'split',
    }
    await $api.ffNotes.splitFfNotesFromPayment(ffPayment.value.id, body)
    snackbar.add({ type: 'success', text: 'Notes splitted' })
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveFfNoteNotes = async () => {
  try {
    loadingStore.loading = true
    const body = {
      notes: noteEdit.value.notes,
    }
    await $api.ffNotes.updateFfNoteNotes(noteEdit.value.notePayment.ff_note.id, body)
    snackbar.add({ type: 'success', text: 'Notes updated' })
    closeFfNoteNotes()
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const addNoteToReqPayment = async (ffNote: any) => {
  try {
    loadingStore.loading = true
    const body = {
      ff_note_id: ffNote.id,
      ff_payment_id: ffPayment.value.id,
    }
    await $api.ffNotes.reqPaymentLinkNote(ffPayment.value.id, body)
    snackbar.add({ type: 'success', text: 'Note linked' })
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.ffNotes.getPaymentById(props.id.toString())) as any

    ffPayment.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()

onMounted(() => {
  const ffNoteId = route.query.ff_note_id
  if (ffNoteId) {
    const el = document.getElementById(`ff-note-${ffNoteId}`)
    if (el) {
      // add blink class
      el.classList.add('animate-pulse')
      el.classList.add('bg-blue-100')
      setTimeout(() => {
        el.classList.remove('animate-pulse')
        el.classList.remove('bg-blue-100')
      }, 15000)
    }
  }
})
</script>
