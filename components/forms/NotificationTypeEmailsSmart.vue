<template>
  <v-card class="mb-4">
    <v-card-title>
      <div class="flex justify-between">
        <div>Notify internal emails</div>
        <div>
          <v-btn icon size="x-small" @click="toggle" :color="showForm ? 'black' : 'success'">
            <v-icon v-if="showForm">mdi-close</v-icon>
            <v-icon v-if="!showForm">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card-title>
    <v-card-text>
      <div v-if="showForm" class="bg-white p-4 mb-4 grid grid-cols-2 gap-2">
        <div class="col-span-2">
          <InputText name="email" density="compact" label="Email" />
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
            <th class="text-left" width="20">Actions</th>
            <th class="text-left">Email</th>
            <th class="text-left">Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(notyEmail, index) in notyType.notification_types_emails" :key="`notif-email-${index}`">
            <td>
              <div class="flex gap-2">
                <TrashButton :item="notyEmail" @click="deleteNotyEmail" />
              </div>
            </td>
            <td>{{ notyEmail.email }}</td>
            <td>{{ formatDateString(notyEmail.created_at) }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/notificationTypeEmailForm'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const notyType = ref<any>({
  emails: [],
})

const { handleSubmit, values, errors, resetForm } = useForm({
  validationSchema: schema,
})

const showForm = ref(false)

const toggle = () => {
  showForm.value = !showForm.value
}

const onSuccess = async (values: any) => {
  values.id = props.id
  const resp = await $api.notificationsTypes.addEmail(props.id, values)

  console.log(values)
  snackbar.add({ type: 'success', text: 'Email created' })

  toggle()
  await getNotyType()
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const save = handleSubmit(onSuccess, onInvalidSubmit)

const deleteNotyEmail = async (notyEmail: any) => {
  try {
    loadingStore.start()
    await $api.notificationsTypes.deleteEmail(props.id, notyEmail.id)
    snackbar.add({ type: 'success', text: 'Email deleted' })
    await getNotyType()
  } catch (e: any) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getNotyType = async () => {
  try {
    loadingStore.start()
    const response = (await $api.notificationsTypes.getById(props.id)) as any
    notyType.value = response
  } catch (e: any) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getNotyType()
})
</script>
