<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex gap-4">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-note-outline</v-icon>
            <div class="ml-2 font-bold">Executive notes</div>
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
                <InputTextArea name="note" density="compact" variant="solo-filled" label="Note" :rows="3" />
              </div>
            </div>
            <v-btn color="primary" @click="saveNote"> Save </v-btn>
          </div>
        </div>
        <div>
          <v-table class="w-full text-sm text-left">
            <thead>
              <tr>
                <th></th>
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
              <td>
                <TrashButton :item="note" @click="showConfirmDelete" />
              </td>
              <td class="p-2">{{ note.creator?.name }}</td>
              <td>{{ note.note }}</td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="note">
                  {{ formatDateString(note.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </v-table>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
import { schemaNotes } from '~/forms/executiveForm'
const loadingStore = useLoadingStore()

const props = defineProps({
  executive: {
    type: Object,
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
  validationSchema: schemaNotes,
})

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const onSuccess = async (values: any) => {
  try {
    loadingStore.loading = true
    const response = await $api.executives.addExecutiveNote(props.executive.id.toString(), values)

    snackbar.add({ type: 'success', text: 'Note created' })
    // await getReferencesNotes()
    notes.value = [...notes.value, response]
    showForm.value = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const showConfirmDelete = async (executive: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Delete',
    content: 'Please confirm you want to delete this note.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'red',
      text: 'Delete',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      const response = await $api.executives.deleteNote(executive.id)
      snackbar.add({ type: 'success', text: 'Note deleted' })
      notes.value = notes.value.filter((note: any) => note.id !== executive.id)
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
  const response = await $api.lines.getLineNotes(props.executive.id.toString())

  notes.value = response as any
}

const saveNote = handleSubmit(onSuccess, onInvalidSubmit)

watch(
  () => props.executive,
  async () => {
    notes.value = props.executive.notes || []
  },
  { immediate: true, deep: true }
)
</script>
