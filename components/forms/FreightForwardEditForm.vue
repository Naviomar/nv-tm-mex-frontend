<template>
  <div>
    <div class="grid grid-cols-12 gap-4 mb-2">
      <div class="col-span-6">
        <v-card color="">
          <v-card-text>
            <div>
              <InputText density="compact" name="name" label="Name *" />
            </div>
            <div>
              <InputAutocomplete
                name="freight_group_id"
                label="Freight group"
                :items="catalogs.freightGroups"
                item-value="id"
                item-title="name"
                density="compact"
              />
            </div>
            <div>
              <InputText density="compact" name="tax_number" label="RFC" />
            </div>
            <div>
              <InputText density="compact" name="contact_name" label="Contact Name *" />
            </div>
            <div>
              <InputText density="compact" name="contact_phone" label="Contact Phone *" />
            </div>
            <div>
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
              <InputText density="compact" name="state" label="State" />
            </div>
            <div>
              <InputText density="compact" name="zip_code" label="Zip code" />
            </div>
            <div class="flex justify-end items-center">
              <NuxtLink
                to="/configuration/freight-forwarders"
                class="mr-4 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                Cancel
              </NuxtLink>
              <button
                type="button"
                @click="validateBeforeCreate"
                class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Save
              </button>
            </div>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-span-6">
        <FreightBankForm :id="id!.toString()" />
        <FFagentEmailsForm :freightForwarder="values" @refresh="getData" />
      </div>
    </div>

    <SimilarItemsDialog
      v-model="showSimilarDialog"
      :similar-items="similarNames"
      :current-name="values.name"
      @proceed="confirmCreateFreightForwarder"
    />
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/freightforwarderEditForm'

const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const id = route.params.id

const similarNames = ref<any>([])
const showSimilarDialog = ref(false) // Controls dialog visibility

const { handleSubmit, values, errors, setValues } = useForm({
  validationSchema: schema,
})

const catalogs = ref({
  countries: [] as any,
  banks: [] as any,
  freightGroups: [] as any,
})

const confirmCreateFreightForwarder = () => {
  saveFfAgent()
}

const validateBeforeCreate = async () => {
  if (!values.name || values.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }
  await searchFFAgentByName()
  if (similarNames.value.length === 0) {
    confirmCreateFreightForwarder()
    return
  }
  showSimilarDialog.value = true
}

const searchFFAgentByName = async () => {
  try {
    loadingStore.loading = true
    const body = {
      name: values.name,
    }
    const response = await $api.freightForwarders.searchByName(body)
    const items = Array.isArray(response) ? response : []
    similarNames.value = items.filter((ff: any) => String(ff.id) !== String(id))
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onSuccess = async (values: any) => {
  const body = {
    ...values,
  }
  await $api.freightForwarders.update(id!.toString(), body)

  snackbar.add({
    type: 'success',
    text: 'freight forwarder updated',
  })
  router.push('/configuration/freight-forwarders')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const getCatalogs = async () => {
  const response = await $api.freightForwarders.getCatalogs()
  catalogs.value = response as any
}

const saveFfAgent = handleSubmit(onSuccess, onInvalidSubmit)

const getData = async () => {
  try {
    loadingStore.start()
    const response = await $api.freightForwarders.getById(id!.toString())
    setValues({
      ...response,
    })
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
