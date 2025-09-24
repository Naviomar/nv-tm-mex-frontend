<script setup lang="ts">
import { schema } from '~~/forms/seaTrafficForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const { handleSubmit, values, errors, meta, handleReset } = useForm({
  validationSchema: schema,
})

const form = ref({
  name: '',
})

const onSuccess = async (values: any) => {
  const response = await $api.seaTraffics.create(values)

  snackbar.add({ type: 'success', text: 'Sea traffic created' })
  router.push('/configuration/sea-traffics')
}

function onInvalidSubmit({ values, errors, results } : any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const saveSeaTraffic = handleSubmit(onSuccess, onInvalidSubmit)
</script>
<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText variant="outlined" name="name" label="Name *" required />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/sea-traffics"> Cancel </v-btn>
          <v-btn color="primary" @click="saveSeaTraffic"> Save </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
