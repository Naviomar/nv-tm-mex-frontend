<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex justify-center gap-4">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-note-outline</v-icon>
            <div class="ml-2 font-bold">Air service notes</div>
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
        <div v-if="showForm" class="p-2">
          <div class="font-bold">New note</div>
          <div>
            <div class="">
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
                <th class="w-64">User</th>
                <th>Note</th>
                <th>Date</th>
              </tr>
            </thead>
            <tr
              class="odd:bg-blue-100 dark:odd:bg-neutral-700"
              v-for="(note, index) in notes"
              :key="`ref-note-${index}`"
            >
              <td class="p-2">{{ note.creator?.name }}</td>
              <td>{{ note.name }}</td>
              <td>{{ formatDateString(note.created_at) }}</td>
            </tr>
          </table>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
import { schema } from '~~/forms/seaImportNotesReferenceForm'
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  serviceId: {
    type: [String, Number],
    required: true,
  },
})

const notes = ref<any>([])

const form = ref({
  note: null,
})

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
    await $api.airReferences.addServiceNote(props.serviceId.toString(), values)

    snackbar.add({ type: 'success', text: 'Service note created' })
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

const getReferencesNotes = async () => {
  const response = await $api.airReferences.getServiceNotes(props.serviceId.toString())

  notes.value = response as any
}

const saveNote = handleSubmit(onSuccess, onInvalidSubmit)

onMounted(async () => {
  await getReferencesNotes()
})
</script>
