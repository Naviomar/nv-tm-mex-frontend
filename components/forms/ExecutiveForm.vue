<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputAutocomplete
            name="executive_group_id"
            item-title="name"
            item-value="id"
            :items="catalogs.executive_groups"
            label="Group"
            density="compact"
          />
        </div>
        <div>
          <InputText name="name" label="Name *" density="compact" />
        </div>
        <div class="flex justify-center items-center">
          <NuxtLink
            to="/configuration/executives"
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

      <div v-if="values && id" class="col-span-6">
        <ExecutiveNotesForm :executive="values" />
      </div>

      <div class="col-span-6">
        <button
          type="button"
          @click="fetchSimilarExecutives"
          class="mb-2 inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Search similar
        </button>

        <div
          v-if="similarItems.length > 0"
          class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2 rounded"
        >
          <div class="text-sm font-bold mb-2">Executives with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="executive in similarItems" :key="executive.id" class="p-1">
              {{ executive.name }} #{{ executive.id }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="saveExecutive" />
  </div>
</template>

<script setup lang="ts">
import { schema } from '~~/forms/executiveForm'
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
      const response = (await $api.executives.getById(id)) as any
      setValues(response)
    }
  },
  { immediate: true }
)

const { handleSubmit, setValues, values } = useForm({
  validationSchema: schema,
})

const catalogs = ref<any>({
  executive_groups: [],
})

const getExecutiveCatalogs = async () => {
  const response = await $api.executives.getCatalogs()
  catalogs.value = response as any
}

const fetchSimilarExecutives = async () => {
  try {
    loadingStore.loading = true
    const body = { name: values.name }
    const response = await $api.executives.searchByName(body)
    const items = Array.isArray(response) ? response : []
    similarItems.value = props.id ? items.filter((executive: any) => String(executive.id) !== String(props.id)) : items
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

  await fetchSimilarExecutives()
  if (similarItems.value.length === 0) {
    saveExecutive()
    return
  }
  showSimilarDialog.value = true
}

const onSuccess = async (values: any) => {
  if (props.id) {
    await $api.executives.update(props.id, values)
    snackbar.add({ type: 'success', text: 'Executive updated' })
    router.push('/configuration/executives')
    return
  }

  if (!props.id) {
    await $api.executives.create(values)
    snackbar.add({ type: 'success', text: 'Executive created' })
    router.push('/configuration/executives')
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values)
  console.log(errors)
  console.log(results)
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const saveExecutive = handleSubmit(onSuccess, onInvalidSubmit)

onMounted(async () => {
  await getExecutiveCatalogs()
})
</script>
