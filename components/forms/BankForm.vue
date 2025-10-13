<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Bank name *" />
        </div>
        <div>
          <InputText density="compact" name="code" label="Code *" />
        </div>
        <div>
          <InputAutocomplete
            name="country_id"
            density="compact"
            :items="countries"
            item-title="name"
            item-value="id"
            label="Country *"
          />
        </div>

        <div class="flex justify-center items-center mt-4">
          <v-btn class="mr-4" color="secondary" to="/configuration/banks"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>
      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="fetchSimilarBanks"> Search similar </v-btn>
        <div
          v-if="similarItems.length > 0"
          class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2 rounded"
        >
          <div class="text-sm font-bold mb-2">Bank with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="bank in similarItems" :key="bank.id" class="p-1">{{ bank.name }} #{{ bank.id }}</div>
          </div>
        </div>
      </div>
    </div>
    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="save" />
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/bankForm'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const loadingStore = useLoadingStore()

const similarItems = ref<any>([])
const showSimilarDialog = ref(false)
const countries = ref<any[]>([])

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
      const response = (await $api.banks.getById(id)) as any
      const bank = response.data ? response.data : response

      setValues(bank)
    }
  },
  { immediate: true }
)

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const getCountries = async () => {
  try {
    const response = await $api.countries.getAll()
    countries.value = response
  } catch (e) {
    console.error('Error fetching countries:', e)
    countries.value = []
  }
}

await getCountries()

const fetchSimilarBanks = async () => {
  try {
    loadingStore.loading = true
    const body = { name: values.name }
    const response = await $api.banks.searchByName(body)

    similarItems.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const validateBeforeCreate = async () => {
  if (!values!.name || values!.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }

  await fetchSimilarBanks()
  showSimilarDialog.value = true
}

const onSuccess = async (formValues: any) => {
  if (props.id) {
    await $api.banks.update(props.id, formValues)
    snackbar.add({ type: 'success', text: 'Bank updated' })
  } else {
    await $api.banks.create(formValues)
    snackbar.add({ type: 'success', text: 'Bank created' })
  }
  router.push('/configuration/banks')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values)
  console.log(errors)
  console.log(results)
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}
const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
