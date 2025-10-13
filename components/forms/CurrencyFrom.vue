<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText variant="outlined" name="name" label="Currency name *" required />
        </div>
        <div>
          <InputText variant="outlined" name="code" label="Code *" required />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/currencies"> Cancel </v-btn>
          <v-btn color="primary" @click="save"> Save </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/bankForm'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()

const { handleSubmit, values, errors, meta, handleReset } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  values.country_id = values.country_id.id
  const response = await $api.currencies.create(values)

  snackbar.add({ type: 'success', text: 'Currency created' })
  router.push('/configuration/currencies')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}
const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
