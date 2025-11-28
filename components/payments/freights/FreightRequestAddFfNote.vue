<template>
  <div>
    <v-btn color="primary" size="small" class="mb-4" @click="showDialog">Add F.F. note available</v-btn>
    <v-dialog v-model="form.show" max-width="800">
      <v-card>
        <v-card-title>Search & add a F.F. available note</v-card-title>
        <v-card-text>
          <div v-if="!form.ffNote">
            <v-text-field v-model="form.ffNoteId" label="F.F. note Id #" clearable />
            <v-btn color="primary" @click="serachFfNote">Search</v-btn>
          </div>
          <div v-if="form.ffNote">
            <v-btn size="x-small" color="purple" @click="form.ffNote = null">Clear</v-btn>
            <v-table density="compact">
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
                <tr>
                  <td>
                    <v-btn color="primary" size="x-small" @click="onClickAddNote">Add</v-btn>
                  </td>
                  <td class="whitespace-nowrap">{{ form.ffNote.folio }}</td>
                  <td class="whitespace-nowrap">{{ form.ffNote.serviceable?.reference_number }}</td>
                  <td>{{ form.ffNote.forwarder?.name }}</td>
                  <td class="whitespace-nowrap">
                    <UserInfoBadge :item="form.ffNote">
                      {{ formatDateString(form.ffNote.created_at) }}
                    </UserInfoBadge>
                  </td>
                  <td  class="whitespace-nowrap">{{ getCurrencyName(form.ffNote.currency_id) }} {{ formatToCurrency(form.ffNote.amount) }}</td>
                  <td>
                    <div v-if="form.ffNote.checked_at">
                      <v-btn density="compact" color="green" variant="outlined" icon="mdi-lock-outline"></v-btn>
                    </div>
                    <div v-if="!form.ffNote.checked_at">
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
  ffNote: null,
})

const emits = defineEmits(['addNote'])

const showDialog = () => {
  form.show = true
}

const onClickAddNote = () => {
  emits('addNote', form.ffNote)
  form.ffNote = null
  form.show = false
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
    form.ffNote = response
    snackbar.add({ type: 'success', text: 'F.F. note available found' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
