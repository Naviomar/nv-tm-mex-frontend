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
          <NuxtLink
            to="/configuration/banks"
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
      </div>
      <div class="col-span-6">
        <button
          type="button"
          @click="fetchSimilarBanks"
          class="mb-2 inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Search similar
        </button>
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
  { immediate: true },
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
    const currentName = values.name
    const body = { name: currentName }
    const response = await $api.banks.searchByName(body)

    const items = Array.isArray(response) ? response : []
    similarItems.value = props.id ? items.filter((bank: any) => String(bank.id) !== String(props.id)) : items
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
  if (similarItems.value.length === 0) {
    // No similar banks found, save directly
    save()
    return
  }

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
