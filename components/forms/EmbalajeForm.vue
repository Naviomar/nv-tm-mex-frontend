<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div>
          <InputText density="compact" name="code" label="Code" />
        </div>

        <div class="flex justify-center items-center mt-4">
          <NuxtLink
            to="/configuration/embalajes"
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
          @click="fetchSimilarEmbalajes"
          class="mb-2 inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Search similar
        </button>

        <div
          v-if="similarsItems.length > 0"
          class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2 rounded"
        >
          <div class="text-sm font-bold mb-2">Embalajes with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="embalaje in similarsItems" :key="embalaje.id" class="p-1">
              {{ embalaje.name }} #{{ embalaje.id }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarsItems" @proceed="saveEmbalaje" />
  </div>
</template>

<script setup lang="ts">
import { schema } from '~~/forms/embalajeForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const similarsItems = ref<any>([])
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
      const response = (await $api.embalajes.getById(id)) as any
      setValues(response)
    }
  },
  { immediate: true }
)

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const fetchSimilarEmbalajes = async () => {
  try {
    loadingStore.loading = true
    const body = { name: values.name }
    const response = await $api.embalajes.searchByName(body)
    const items = Array.isArray(response) ? response : []
    similarsItems.value = props.id ? items.filter((embalaje: any) => String(embalaje.id) !== String(props.id)) : items
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

  await fetchSimilarEmbalajes()
  if (similarsItems.value.length === 0) {
    saveEmbalaje()
    return
  }
  showSimilarDialog.value = true
}

const onSuccess = async (formValues: any) => {
  if (props.id) {
    await $api.embalajes.update(props.id, formValues)
    snackbar.add({ type: 'success', text: 'Embalaje updated' })
  } else {
    await $api.embalajes.create(formValues)
    snackbar.add({ type: 'success', text: 'Embalaje created' })
  }
  router.push('/configuration/embalajes')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const saveEmbalaje = handleSubmit(onSuccess, onInvalidSubmit)
</script>
