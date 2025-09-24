<template>
  <div>
    <div class="">
      <div class="mb-4">
        <InputAutocomplete
          name="vessel_id"
          density="compact"
          label="Vessel"
          :items="catalogs.vessels"
          item-value="id"
          :item-title="
            (row : any) => {
              return `${row.line?.name} - ${row.name}`
            }
          "
        />

        <v-btn density="compact" color="warning" size="small" to="/configuration/vessels/add">New vessel</v-btn>
      </div>
      <div>
        <InputText name="name" density="compact" label="Voyage" />
      </div>
      <div>
        <InputAutocomplete
          name="impoExpo"
          density="compact"
          label="Import / Export"
          :items="[
            { id: 'I', name: 'Import' },
            { id: 'E', name: 'Export' },
          ]"
          item-value="id"
          item-title="name"
        />
      </div>

      <div class="flex justify-center items-center">
        <v-btn class="mr-4" color="secondary" @click="router.back"> Cancel </v-btn>
        <v-btn color="primary" @click="onVoyageClickUpdate"> Update </v-btn>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schemaEdit } from '~~/forms/voyageForm'

const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const { handleSubmit, values, errors, setValues } = useForm({
  validationSchema: schemaEdit,
})

const catalogs = ref({
  ports: [] as any,
  vessels: [] as any,
})

const onSuccess = async (values: any) => {
  console.log('click submit', values)
  const response = await $api.voyages.update(props.id, values)
  snackbar.add({ type: 'success', text: 'Voyage updated' })
  router.push('/configuration/voyages')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const getVoyageCatalogs = async () => {
  const response = await $api.voyages.getCatalogs()

  catalogs.value = response as any
}

const getData = async () => {
  try {
    const response = (await $api.voyages.getById(props.id)) as any
    response.vessel_id = catalogs.value.vessels.find((c: any) => c.id === response?.vessel_id).id
    setValues(response)
  } catch (e: any) {
    console.error(e)
  }
}

const onVoyageClickUpdate = handleSubmit(onSuccess, onInvalidSubmit)

onMounted(async () => {
  await getVoyageCatalogs()
  await getData()
})
</script>
