<template>
  <v-dialog :model-value="modelValue" max-width="640" @update:model-value="(val) => emit('update:modelValue', val)">
    <v-card>
      <v-card-title>Replace with agent Debit Note</v-card-title>
      <v-card-text>
        <div class="locked-section mb-4">
          <div class="grid grid-cols-2 gap-2 mb-3 text-sm px-3 pt-3">
            <div><strong>Currency:</strong> {{ getCurrencyName(creditNote?.currency_id) }}</div>
            <div><strong>Party:</strong> {{ creditNote?.party?.name ?? creditNote?.forwarder?.name }}</div>
            <div><strong>Total:</strong> {{ formatToCurrency(totalAmount) }}</div>
          </div>

          <v-table density="compact" class="mx-3 mb-3 locked-table">
            <thead>
              <tr>
                <th>Charge</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="concept in creditNote?.concepts ?? []" :key="concept.id">
                <td>{{ concept.charge?.name }}</td>
                <td>{{ formatToCurrency(concept.amount) }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <div class="editable-section pa-3">
          <v-text-field v-model="form.folio" label="Folio *" density="compact" variant="outlined" />
          <v-switch v-model="form.as_invoice" label="As invoice" density="compact" color="primary" />
          <v-file-input
            v-model="form.attachment"
            label="File"
            accept="application/pdf"
            density="compact"
            variant="outlined"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="red" variant="text" @click="close">Cancel</v-btn>
        <v-spacer />
        <v-btn color="primary" :disabled="!form.folio" @click="confirmReplace">Replace</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  creditNote: {
    type: Object as () => any,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'replaced'])

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const defaultForm = () => ({ folio: null as string | null, as_invoice: false, attachment: null as File | null })
const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      form.value = defaultForm()
    }
  },
)

const totalAmount = computed(() =>
  (props.creditNote?.concepts ?? []).reduce((acc: number, c: any) => acc + (Number.parseFloat(c.amount) || 0), 0),
)

const close = () => {
  emit('update:modelValue', false)
}

const confirmReplace = async () => {
  try {
    if (!form.value.folio) {
      snackbar.add({ type: 'warning', text: 'You must enter the folio.' })
      return
    }
    loadingStore.start()
    const payload: Record<string, any> = {
      folio: form.value.folio,
      as_invoice: form.value.as_invoice ? 1 : 0,
    }
    if (form.value.attachment) {
      payload.attachment = form.value.attachment
    }
    await $api.ffNotes.replaceWithAgentDebitNote(props.creditNote.id, payload)
    snackbar.add({ type: 'success', text: 'Credit Note replaced with the agent Debit Note.' })
    close()
    emit('replaced')
  } catch (e: any) {
    console.error(e)
    snackbar.add({
      type: 'error',
      text: e?.data?.message || e?.response?.data?.message || 'Error replacing the note.',
    })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>

<style scoped>
.locked-section {
  background-color: rgba(128, 128, 128, 0.08);
  border: 1px dashed rgba(128, 128, 128, 0.4);
  border-radius: 8px;
}
.locked-table :deep(th),
.locked-table :deep(td) {
  background-color: transparent;
}
.editable-section {
  border: 1px solid rgba(var(--v-theme-primary), 0.5);
  border-radius: 8px;
}
</style>
