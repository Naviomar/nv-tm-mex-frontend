<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputAutocomplete
            density="compact"
            name="country_id"
            label="Country *"
            :items="catalogs.countries"
            item-title="name"
            item-value="id"
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
      <div class="col-span-6"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/destinationForm'

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
  const response = await $api.destinations.update(props.id, values)
  snackbar.add({ type: 'success', text: 'Location updated' })
  router.push('/configuration/destinations')
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
    const response = await $api.destinations.getCatalogs()

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
    const response = (await $api.destinations.getById(props.id)) as any
    setValues(response)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getCatalogs()
  await getData()
})
</script>
