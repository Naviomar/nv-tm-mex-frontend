<template>
  <div>
    <div class="grid grid-cols-12 gap-4 mb-2">
      <div class="col-span-6">
        <v-card color="">
          <v-card-text>
            <div>
              <InputText density="compact" name="name" label="Name *" />
            </div>
            <div>
              <InputText density="compact" name="code" label="Code *" />
            </div>
            <div class="flex justify-end items-center">
              <v-btn class="mr-4" color="secondary" to="/configuration/notifications-types"> Cancel </v-btn>
              <v-btn color="primary" @click="save"> Save </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-span-6">
        <NotificationTypeEmailsSmart :id="id" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/notificationTypeForm'

const router = useRouter()
const route = useRoute()
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const id = route.params.id!.toString()

const { handleSubmit, values, errors, resetForm } = useForm({
  validationSchema: schema,
})

const emails = ref([])

const onSuccess = async (values: any) => {
  const body = {
    ...values,
  }
  const response = await $api.notificationsTypes.updateNotificationsTypes(id.toString(), body)
  snackbar.add({ type: 'success', text: 'Notification Type updated' })
  router.push('/configuration/notifications-types')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const save = handleSubmit(onSuccess, onInvalidSubmit)

const getEmails = async () => {
  try {
    loadingStore.start()
    const response = (await $api.notificationsTypes.getById(route.params.id!.toString())) as any
    emails.value = response.notification_types_emails
    loadingStore.loading = false
    resetForm({ values: response as any })
  } catch (e: any) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getEmails()
})
</script>
