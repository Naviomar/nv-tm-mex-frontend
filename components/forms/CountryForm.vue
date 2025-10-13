<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText name="name" density="compact" label="Name *" />
        </div>
        <div>
          <InputText name="code" density="compact" label="ISO Code 2 digits *" />
        </div>
        <div>
          <InputText name="code2" density="compact" label="ISO Code 3 digits *" />
        </div>

        <div class="flex justify-center items-center mt-4">
          <v-btn class="mr-4" color="secondary" to="/configuration/countries"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>

      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="fetchSimilarCountries"> Search similar </v-btn>

        <div
          v-if="similarItems.length > 0"
          class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2 rounded"
        >
          <div class="text-sm font-bold mb-2">Countries with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="country in similarItems" :key="country.id" class="p-1">
              {{ country.name }} #{{ country.id }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="save" />
  </div>
</template>

<script setup lang="ts">
import { schema } from '~~/forms/countryForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const similarItems = ref<any>([])
const showSimilarDialog = ref(false)

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
})

watch(
  () => props.id,
  async (id) => {
    if (id) {
      const response = (await $api.countries.getById(id)) as any
      setValues(response)
    }
  },
  { immediate: true }
)

const { handleSubmit, setValues, values } = useForm({
  validationSchema: schema,
})

const fetchSimilarCountries = async () => {
  try {
    loadingStore.loading = true
    const body = { name: values.name }
    const response = await $api.countries.searchByName(body)

    similarItems.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const validateBeforeCreate = async () => {
  if (!values!.name || values!.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }

  await fetchSimilarCountries()
  showSimilarDialog.value = true
}

const onSuccess = async (formValues: any) => {
  if (props.id) {
    await $api.countries.update(props.id, formValues)
    snackbar.add({ type: 'success', text: 'Country updated' })
  } else {
    await $api.countries.create(formValues)
    snackbar.add({ type: 'success', text: 'Country created' })
  }
  router.push('/configuration/countries')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values)
  console.log(errors)
  console.log(results)
  snackbar.add({ type: 'error', text: 'Please fill in all required fields' })
}

const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
