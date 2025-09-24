<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Notification type name *" />
        </div>
        <div>
          <InputText density="compact" name="code" label="Code *" />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/notifications-types"> Cancel </v-btn>
          <v-btn color="primary" @click="save"> Save </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/notificationTypeForm'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()

const { handleSubmit, values, errors, meta, handleReset } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  console.log('click submit', values)

  const response = await $api.notificationsTypes.create(values)
  snackbar.add({ type: 'success', text: 'Notification Type created' })
  router.push('/configuration/notifications-types')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}
const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
