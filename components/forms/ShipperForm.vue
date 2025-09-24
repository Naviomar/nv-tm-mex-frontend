<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Name *" />
          <v-btn color="primary" size="small" @click="searchShippersByName"> Search similar </v-btn>
          <div v-if="hasSimilarShippers">
            <div class="text-sm font-bold">Results:</div>
            <div v-for="shipper in similiarShippers" :key="shipper.id" class="p-1">
              {{ shipper.name }}
            </div>
          </div>
        </div>
        <div class="pt-4">
          <div class="grid grid-cols-2 gap-2">
            <InputCheckbox name="is_shipper" density="compact" label="Is shipper?" />
            <InputCheckbox name="is_consignee" density="compact" label="Is consignee?" />
          </div>
        </div>
        <div class="pt-4">
          <InputAutocomplete
            name="country_id"
            label="Country"
            :items="catalogs.countries"
            item-value="id"
            item-title="name"
            density="compact"
          />
        </div>
        <div>
          <InputTextArea density="compact" name="address" label="Address" />
        </div>
        <div>
          <InputText density="compact" name="city" label="City" />
        </div>
        <div>
          <InputText density="compact" name="state" label="State" />
        </div>
        <div>
          <InputText density="compact" name="zip_code" label="Zip code" />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/shippers"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>
    </div>

    <SimilarItemsDialog
      v-model="showSimilarDialog"
      :similar-items="similiarShippers"
      :current-name="values.name"
      @proceed="confirmCreateShipper"
    />
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/shipperForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const catalogs = ref({
  countries: [] as any,
})

const similiarShippers = ref<any>([])
const showSimilarDialog = ref(false) // Controls dialog visibility
const hasSimilarShippers = computed(() => similiarShippers.value.length > 0)

const { handleSubmit, values, errors, meta, handleReset } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  const response = await $api.shippers.create(values)

  snackbar.add({ type: 'success', text: 'Shipper created' })
  router.push('/configuration/shippers')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const validateBeforeCreate = async () => {
  if (!values.name || values.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }
  await searchShippersByName()
  showSimilarDialog.value = true
}

const confirmCreateShipper = () => {
  saveShipper()
}

const saveShipper = handleSubmit(onSuccess, onInvalidSubmit)

const searchShippersByName = async () => {
  try {
    loadingStore.loading = true
    const body = {
      name: values.name,
    }
    const response = await $api.shippers.searchByName(body)
    similiarShippers.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const response = await $api.countries.getAll()
catalogs.value.countries = response
</script>
