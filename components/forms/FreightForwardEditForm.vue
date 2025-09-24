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
              <v-btn class="mr-4" color="secondary" to="/configuration/freight-forwarders"> Cancel </v-btn>
              <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
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
const hasSimilarNames = computed(() => similarNames.value.length > 0)

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
  showSimilarDialog.value = true
}

const searchFFAgentByName = async () => {
  try {
    loadingStore.loading = true
    const body = {
      name: values.name,
    }
    const response = await $api.freightForwarders.searchByName(body)
    similarNames.value = response
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
