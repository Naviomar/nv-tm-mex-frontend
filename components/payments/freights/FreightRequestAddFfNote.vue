<template>
  <div>
    <v-btn color="primary" size="small" class="mb-4" @click="showDialog">Add F.F. note available</v-btn>
    <v-dialog v-model="form.show" max-width="800">
      <v-card>
        <v-card-title>Search & add a F.F. available note</v-card-title>
        <v-card-text>
          <div>
            <v-text-field v-model="form.ffNoteId" label="F.F. note Id # (folio, full or partial)" clearable @keyup.enter="serachFfNote" />
            <v-btn color="primary" @click="serachFfNote">Search</v-btn>
            <v-btn v-if="form.ffNotes" size="x-small" color="purple" class="ml-2" @click="form.ffNotes = null">Clear</v-btn>
          </div>
          <div v-if="form.ffNotes">
            <div v-if="form.ffNotes.length === 0" class="text-body-2 text-medium-emphasis mt-2">
              No matching notes found.
            </div>
            <v-table v-else density="compact">
              <thead>
                <tr>
                  <th class="text-left">Actions</th>
                  <th class="text-left">CN DB #</th>
                  <th class="text-left">Ref #</th>
                  <th class="text-left">F.F. Agent</th>
                  <th class="text-left">Date</th>
                  <th class="text-left">Amount</th>
                  <th class="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ffNote in form.ffNotes" :key="ffNote.id">
                  <td>
                    <v-btn color="primary" size="x-small" @click="onClickAddNote(ffNote)">Add</v-btn>
                  </td>
                  <td class="whitespace-nowrap">{{ ffNote.folio }}</td>
                  <td class="whitespace-nowrap">{{ ffNote.serviceable?.reference_number }}</td>
                  <td>{{ ffNote.forwarder?.name }}</td>
                  <td class="whitespace-nowrap">
                    <UserInfoBadge :item="ffNote">
                      {{ formatDateString(ffNote.created_at) }}
                    </UserInfoBadge>
                  </td>
                  <td  class="whitespace-nowrap">{{ getCurrencyName(ffNote.currency_id) }} {{ formatToCurrency(ffNote.amount) }}</td>
                  <td>
                    <div v-if="ffNote.checked_at">
                      <v-btn density="compact" color="green" variant="outlined" icon="mdi-lock-outline"></v-btn>
                    </div>
                    <div v-if="!ffNote.checked_at">
                      <v-btn size="x-small" color="warning" variant="outlined" icon="mdi-lock-open-outline"></v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="form.show = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  ffPayment: {
    type: Object,
    required: true,
  },
})

const form = reactive<any>({
  show: false,
  ffNoteId: null,
  ffNotes: null as any[] | null,
})

const emits = defineEmits(['addNote'])

const showDialog = () => {
  form.ffNoteId = null
  form.ffNotes = null
  form.show = true
}

const onClickAddNote = (ffNote: any) => {
  emits('addNote', ffNote)
  // Keep the dialog open and drop the added note from the results so the user
  // can pick more than one match (e.g. the same D/C note split across several
  // references) before closing.
  form.ffNotes = form.ffNotes?.filter((n: any) => n.id !== ffNote.id) ?? null
}

const serachFfNote = async () => {
  try {
    if (!form.ffNoteId) {
      snackbar.add({ type: 'warning', text: 'Please enter a F.F. note id' })
      return
    }
    loadingStore.loading = true
    const body = {
      ff_note_id: form.ffNoteId,
      ff_payment_id: props.ffPayment.id,
    }
    const response = (await $api.ffNotes.searchFfNoteForReqPayment(body)) as any
    form.ffNotes = Array.isArray(response) ? response : [response]
    snackbar.add({ type: 'success', text: `${form.ffNotes.length} F.F. note(s) found` })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
