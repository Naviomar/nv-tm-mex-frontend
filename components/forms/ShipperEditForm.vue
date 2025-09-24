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
            <InputCheckbox name="is_shipper" density="compact" label="Is shipper? (For import)" />
            <InputCheckbox name="is_consignee" density="compact" label="Is consignee? (For export)" />
          </div>
        </div>
        <div class="border-2 border-dotted p-2">
          <div class="text-sm font-bold">Address</div>
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
        </div>

        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/shippers"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>
      <div class="col-span-6">
        <div class="border-2 border-dotted p-2 mt-2">
          <div class="text-sm font-bold">Contact</div>
          <div>
            <InputText density="compact" name="contact_name" label="Contact name" />
          </div>
          <div>
            <InputText density="compact" name="contact_email" label="Contact email" />
          </div>
          <div>
            <InputText density="compact" name="contact_phone" label="Contact phone" />
          </div>
          <div>
            <InputText density="compact" name="contact_rfc" label="Contact RFC" />
          </div>
        </div>
      </div>
    </div>

    <SimilarItemsDialog
      v-model="showSimilarDialog"
      :similar-items="similiarShippers"
      :current-name="values.name"
      @proceed="confirmEditShipper"
    />
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/shipperForm'

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

const catalogs = ref({
  countries: [] as any,
})

const similiarShippers = ref<any>([])
const showSimilarDialog = ref(false) // Controls dialog visibility
const hasSimilarShippers = computed(() => similiarShippers.value.length > 0)

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  const response = await $api.shippers.update(props.id, values)

  snackbar.add({ type: 'success', text: 'Record updated' })
  router.push('/configuration/shippers')
}

function onInvalidSubmit({ values, errors, results }: any) {
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

const confirmEditShipper = () => {
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

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.shippers.getById(props.id)) as any
    setValues(response)
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
await getData()
</script>
