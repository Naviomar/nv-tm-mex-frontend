<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <!-- Formulario principal -->
      <div class="col-span-6">
        <div>
          <InputText name="name" density="compact" label="Contract name *" />
        </div>
        <div>
          <InputAutocomplete
            name="line_id"
            density="compact"
            :items="catalogs.lines"
            item-title="name"
            item-value="id"
            label="Line"
          />
        </div>

        <!-- Botones -->
        <div class="flex justify-center items-center mt-4">
          <NuxtLink
            to="/configuration/services-contracts"
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

      <!-- Panel de similares opcional -->
      <div class="col-span-6">
        <button
          type="button"
          @click="fetchSimilarContracts"
          class="mb-2 inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Search similar
        </button>

        <div
          v-if="similarItems.length > 0"
          class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2 rounded"
        >
          <div class="text-sm font-bold mb-2">Service contracts with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="contract in similarItems" :key="contract.id" class="p-1">
              {{ contract.name }} #{{ contract.id }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de similares -->
    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="saveFreightForwarder" />
  </div>
</template>

<script setup lang="ts">
import { schema } from '~~/forms/serviceContractForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const props = defineProps({ id: { type: String, required: false } })

const similarItems = ref<any[]>([])
const showSimilarDialog = ref(false)

const catalogs = ref({ lines: [] as any })

const { handleSubmit, values, setValues } = useForm({ validationSchema: schema })

// Cargar datos al editar
watch(
  () => props.id,
  async (id) => {
    if (id) {
      const response = (await $api.servicesContracts.getById(id)) as any
      setValues(response)
    }
  },
  { immediate: true }
)

// Buscar similares para modal o panel
const fetchSimilarContracts = async () => {
  try {
    const body = { name: values.name }
    const response = await $api.servicesContracts.searchByName(body)
    const items = Array.isArray(response) ? response : []
    similarItems.value = props.id ? items.filter((contract: any) => String(contract.id) !== String(props.id)) : items
  } catch (e) {
    console.error(e)
  }
}

const validateBeforeCreate = async () => {
  if (!values.name || values.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }
  await fetchSimilarContracts()
  if (similarItems.value.length === 0) {
    saveFreightForwarder()
    return
  }
  showSimilarDialog.value = true
}

const onSuccess = async (formValues: any) => {
  if (props.id) {
    await $api.servicesContracts.update(props.id, formValues)
    snackbar.add({ type: 'success', text: 'Service contract updated' })
  } else {
    await $api.servicesContracts.create(formValues)
    snackbar.add({ type: 'success', text: 'Service contract created' })
  }
  router.push('/configuration/services-contracts')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Please fill in all required fields' })
}

const saveFreightForwarder = handleSubmit(onSuccess, onInvalidSubmit)

/** -----------------------
 * Cargar catálogos al inicio
 * ----------------------- */
const getCatalogs = async () => {
  const response = await $api.servicesContracts.getCatalogs()
  catalogs.value = response as any
}

await getCatalogs()
</script>
