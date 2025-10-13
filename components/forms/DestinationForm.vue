<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputAutocomplete
            name="country_id"
            density="compact"
            :items="catalogs.countries"
            item-title="name"
            item-value="id"
            label="Country *"
          />
        </div>
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div>
          <InputText density="compact" name="amacarga_code" label="Amacarga code" />
        </div>

        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/destinations"> Cancel </v-btn>
          <v-btn color="primary" @click="saveCharge"> Save </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/destinationForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const { handleSubmit, values, errors, meta, handleReset } = useForm({
  validationSchema: schema,
})

const catalogs = ref<any>([])

const onSuccess = async (values: any) => {
  const response = await $api.destinations.create(values)

  snackbar.add({ type: 'success', text: 'Location created' })
  router.push('/configuration/destinations')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'error', text: 'Please fill in all required fields' })
}

const getCatalogs = async () => {
  const response = await $api.destinations.getCatalogs({
    query: {
      page: catalogs.value.current_page,
      perPage: catalogs.value.perPage,
    },
  })

  catalogs.value = response as any
}

await getCatalogs()

const saveCharge = handleSubmit(onSuccess, onInvalidSubmit)
</script>
