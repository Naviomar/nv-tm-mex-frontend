<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputFile density="compact" name="file" label="Change logo *" />
        </div>
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div>
          <InputText density="compact" name="code" label="Code *" />
        </div>
        <div>
          <InputText density="compact" name="prefix" label="Prefix *" />
        </div>

        <div>
          <InputAutocomplete
            density="compact"
            name="country_id"
            label="Country"
            :items="catalogs.countries"
            item-title="name"
            item-value="id"
          />
        </div>

        <div>
          <InputTextArea density="compact" name="address" label="Address" />
        </div>
        <div>
          <InputText density="compact" name="zip_code" label="Zip code" />
        </div>

        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/airlines"> Cancel </v-btn>
          <v-btn color="primary" @click="saveCharge"> Save </v-btn>
        </div>
      </div>
      <div class="col-span-6">
        <div>Current logo</div>
        <v-img :src="values.logo_url!" width="200" contain class="rounded-lg" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/airlineForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const catalogs = ref<any>({
  countries: [],
})

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  const response = await $api.airlines.update(props.id, values)

  snackbar.add({ type: 'success', text: 'Airline updated' })
  router.push('/configuration/airlines')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const saveCharge = handleSubmit(onSuccess, onInvalidSubmit)

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = await $api.airlines.getFormCatalogs()

    catalogs.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    loadingStore.start()
    const response = await $api.airlines.getById(props.id)
    setValues(response)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getCatalogs()
await getData()
</script>
