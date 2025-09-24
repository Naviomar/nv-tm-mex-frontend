<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputAutocomplete
            density="compact"
            name="country_id"
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
          <InputText density="compact" name="code" label="Code *" />
        </div>

        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/airports"> Cancel </v-btn>
          <v-btn color="primary" @click="saveCharge"> Save changes </v-btn>
        </div>
      </div>
      <div class="col-span-6"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/airportForm'

const router = useRouter()
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

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
  const response = await $api.airports.update(props.id, values)
  snackbar.add({ type: 'success', text: 'Airport updated' })
  router.push('/configuration/airports')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'error', text: 'Error updating airport' })
}

const saveCharge = handleSubmit(onSuccess, onInvalidSubmit)

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = await $api.airports.getFormCatalogs()

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
    const response = await $api.airports.getById(props.id)
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
