<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex justify-center gap-4">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-note-outline</v-icon>
            <div class="ml-2 font-bold">Sea service notes</div>
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
        <div v-if="showForm" class="p-6">
          <div class="font-bold">Create new reference note</div>
          <div>
            <div class="mt-4">
              <div>
                <InputTextArea name="note" density="compact" variant="solo-filled" label="Reference note" :rows="3" />
              </div>
            </div>
            <v-btn color="primary" @click="saveNote"> Save </v-btn>
          </div>
        </div>
        <div>
          <table class="w-full text-sm text-left">
            <thead>
              <tr>
                <th class="w-12"></th>
                <th class="w-32">Added by</th>
                <th>Note</th>
                <th class="w-32">Date</th>
              </tr>
            </thead>
            <tr
              class="odd:bg-blue-100 dark:odd:bg-neutral-700"
              v-for="(note, index) in notes"
              :key="`ref-note-${index}`"
            >
              <td class="p-2">
                <TrashButton :item="note" @click="confirmDeleteNote(note)" />
              </td>

              <td class="p-2">{{ note.created_by?.name }}</td>
              <td>{{ note.name }}</td>
              <td class="whitespace-nowrap">
                {{ formatDateString(note.created_at) }}
              </td>
            </tr>
          </table>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/seaImportNotesReferenceForm'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  reference: {
    type: Object,
    required: true,
  },
})
const notes = ref<any>([])

const showForm = ref(false)
const toggleForm = () => (showForm.value = !showForm.value)

const { handleSubmit } = useForm({
  validationSchema: schema,
})

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const onSuccess = async (values: any) => {
  try {
    loadingStore.loading = true
    await $api.referencias.addReferenceNote(props.reference.id, values)

    snackbar.add({ type: 'success', text: 'Reference note created' })
    await getReferencesNotes()
    showForm.value = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const confirmDeleteNote = async (note: any) => {
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
        ...note,
      }
      await $api.referencias.deleteReferenceNote(props.reference.id.toString(), body)

      snackbar.add({ type: 'success', text: 'Note deleted' })
      await getReferencesNotes()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getReferencesNotes = async () => {
  const response = await $api.referencias.getReferenceNotes(props.reference.id)

  notes.value = response as any
}

await getReferencesNotes()
const saveNote = handleSubmit(onSuccess, onInvalidSubmit)

const form = ref({
  note: null,
})
</script>
