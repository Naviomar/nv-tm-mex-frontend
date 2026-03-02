<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText name="name" label="Consignee name *" required density="compact" />
        </div>
        <div>
          <InputAutocomplete
            name="has_demurrages"
            label="Init demurrages? *"
            hint="Services will trigger demurrages process if consignee mbl linked."
            :items="[
              { name: 'Yes', value: true },
              { name: 'No', value: false },
            ]"
            item-title="name"
            item-value="value"
            density="compact"
          />
        </div>
        <div class="flex justify-center items-center">
          <NuxtLink
            to="/configuration/consignees-mbl"
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

      <!-- Panel de similares -->
      <div class="col-span-6">
        <button
          type="button"
          @click="fetchSimilarConsignees"
          class="mb-2 inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Search similar
        </button>

        <div v-if="hasSimilars" class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2 rounded">
          <div class="text-sm font-bold mb-2">Consignees with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="item in similarItems" :key="item.id" class="p-1">{{ item.name }} #{{ item.id }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de similares -->
    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="saveConsigneeMbl" />
  </div>
</template>

<script setup lang="ts">
import { schema } from '~~/forms/consigneeMblForm'

const { $api } = useNuxtApp()
const router = useRouter()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
})

const similarItems = ref<any>([])
const showSimilarDialog = ref(false)
const hasSimilars = computed(() => similarItems.value.length > 0)

watch(
  () => props.id,
  async (id) => {
    if (id) {
      const response = (await $api.consigneeMbls.getById(id)) as any

      response.has_demurrages = Boolean(response.has_demurrages)

      setValues(response)
    }
  },
  { immediate: true }
)

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const fetchSimilarConsignees = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.consigneeMbls.searchByName({ name: values.name })
    const items = Array.isArray(response) ? response : []
    similarItems.value = props.id ? items.filter((item: any) => String(item.id) !== String(props.id)) : items
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

  await fetchSimilarConsignees()
  if (similarItems.value.length === 0) {
    // No similar consignees found, save directly
    saveConsigneeMbl()
    return
  }

  showSimilarDialog.value = true
}

const onSuccess = async (formValues: any) => {
  if (props.id) {
    await $api.consigneeMbls.update(props.id, formValues)
    snackbar.add({ type: 'success', text: 'Consignee MBL updated' })
  } else {
    await $api.consigneeMbls.create(formValues)
    snackbar.add({ type: 'success', text: 'Consignee MBL created' })
  }
  router.push('/configuration/consignees-mbl')
}

function onInvalidSubmit() {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const saveConsigneeMbl = handleSubmit(onSuccess, onInvalidSubmit)
</script>
