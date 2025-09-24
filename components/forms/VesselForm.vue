<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div class="mb-4">
          <InputAutocomplete
            name="line_id"
            label="Line *"
            :items="catalogs.lines"
            item-value="id"
            :item-title="(row: any) => `${row.name} (${row.commercial_name})`"
            density="compact"
          />
          <div>
            <div class="flex items-center">
              <div>Doesn't appear line?</div>
              <v-btn color="primary" variant="outlined" size="small" to="/configuration/lines/add"> Add line </v-btn>
            </div>
          </div>
        </div>
        <div>
          <InputAutocomplete
            name="name"
            density="compact"
            :items="catalogs.vesselnames"
            item-value="name"
            item-title="name"
            label="Vessel *"
          />
        </div>
        <div class="flex justify-center items-center gap-4">
          <v-btn color="secondary" to="/configuration/vessels"> Cancel </v-btn>
          <v-btn color="primary" @click="saveVessel"> Save </v-btn>
          <v-btn color="primary" @click="saveVesselAndAddVoyage"> Save & add voyage </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/vesselForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const { handleSubmit, values } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  try {
    loadingStore.start()
    const response = (await $api.vessels.create(values)) as any

    snackbar.add({ type: 'success', text: 'Vessel created' })

    if (sentToVoyagesAdd.value) {
      sentToVoyagesAdd.value = false
      router.push({
        path: '/configuration/voyages/add',
        query: { vessel_id: response.id },
      })
      return
    }
    router.push('/configuration/vessels')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const catalogs = ref<any>({
  lines: [],
  vesselnames: [],
})
const sentToVoyagesAdd = ref(false)

const getVesselCatalogs = async () => {
  const response = await $api.vessels.getCatalogs()
  catalogs.value = response as any
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const saveVesselAndAddVoyage = async () => {
  sentToVoyagesAdd.value = true
  await saveVessel()
}

const saveVessel = handleSubmit(onSuccess, onInvalidSubmit)

onMounted(async () => {
  await getVesselCatalogs()
})
</script>
