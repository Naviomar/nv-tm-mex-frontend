<template>
  <v-card class="mb-4">
    <v-card-title>
      <div class="flex justify-between">
        <div>Emails</div>
        <div>
          <v-btn icon size="x-small" @click="toggle" :color="showForm ? 'black' : 'success'">
            <v-icon v-if="showForm">mdi-close</v-icon>
            <v-icon v-if="!showForm">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card-title>
    <v-card-text>
      <div v-if="showForm" class="p-4 mb-4 grid grid-cols-2 gap-2">
        <div class="col-span-2">
          <InputText name="email" density="compact" variant="solo-filled" label="Email address" />
        </div>
        <div class="col-span-2">
          <div class="flex justify-end items-center">
            <v-btn class="mr-4" color="secondary" @click="toggle"> Cancel </v-btn>
            <v-btn color="primary" @click="save"> Save </v-btn>
          </div>
        </div>
      </div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left" width="50">Actions</th>
            <th class="text-left">Email address</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!hasEmails">
            <td colspan="2" class="text-center">No emails found</td>
          </tr>
          <tr v-for="(supEmail, index) in props.line.emails" :key="`ff-email-${index}`">
            <td>
              <div class="flex gap-2">
                <div class="flex gap-2">
                  <v-btn
                    size="small"
                    variant="text"
                    icon="mdi-delete-outline"
                    color="red-lighten-2"
                    dense
                    @click="showConfirmDelete(supEmail)"
                  ></v-btn>
                </div>
              </div>
            </td>
            <td>{{ supEmail.email }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { schemaEmail } from '~~/forms/customAgentForm'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const props = defineProps({
  line: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['refresh'])

const { handleSubmit } = useForm({
  validationSchema: schemaEmail,
})

const showForm = ref(false)

const toggle = () => {
  showForm.value = !showForm.value
}

const hasEmails = computed(() => {
  return props.line.emails?.length > 0
})

const onSuccess = async (values: any) => {
  try {
    loadingStore.loading = true
    const body = {
      ...values,
      id: props.line.id,
    }
    await $api.lines.addEmail(props.line.id, body)

    snackbar.add({ type: 'success', text: 'Email address created' })

    toggle()
    emit('refresh')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const showConfirmDelete = async (ffEmail: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete this email address.',
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
        id: ffEmail.id,
        freight_forwarder_id: props.line.id,
      }
      await $api.lines.deleteEmail(props.line.id, body)

      snackbar.add({ type: 'success', text: 'Email deleted' })
      emit('refresh')
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
