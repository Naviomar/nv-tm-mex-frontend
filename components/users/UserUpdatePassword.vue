<template>
  <div class="flex justify-center">
    <v-card class="w-full md:w-3/4" variant="flat">
      <v-card-title>Update password</v-card-title>
      <v-card-text>
        <div>
          <InputText name="current_password" density="compact" type="password" label="Current password *" />
        </div>
        <div>
          <InputText name="new_password" density="compact" type="password" label="New password *" />
        </div>
        <div>
          <InputText name="password_confirmation" density="compact" type="password" label="Password confirmation *" />
        </div>
        <div>
          <v-btn color="primary" @click="onUpdatePwClick">Update password</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { schemaUpdatePassword } from '~/forms/userForm'
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const { handleSubmit, values, errors, meta, setValues } = useForm({
  validationSchema: schemaUpdatePassword,
})

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Please fill in all required fields' })
}

const onSuccess = async () => {
  try {
    loadingStore.start()
    const body = {
      ...values,
    }
    const res = await $api.users.updateUserPassword(body)

    snackbar.add({ type: 'success', text: 'Password updated successfully' })
  } catch (e: any) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onUpdatePwClick = handleSubmit(onSuccess, onInvalidSubmit)
</script>
