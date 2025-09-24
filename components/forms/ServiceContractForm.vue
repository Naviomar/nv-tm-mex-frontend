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
          <v-btn class="mr-4" color="secondary" to="/configuration/services-contracts"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>

      <!-- Panel de similares opcional -->
      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="fetchSimilarContracts"> Search similar </v-btn>

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
    similarItems.value = response
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
