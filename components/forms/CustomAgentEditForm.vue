<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div>
          <InputText density="compact" name="patente" label="Patente *" />
        </div>
        <div>
          <InputText density="compact" name="agencia" label="Agencia" />
        </div>
        <div>
          <InputAutocomplete
            density="compact"
            name="ports"
            :items="catalogs.ports"
            item-title="name"
            item-value="id"
            label="Ports"
            :multiple="true"
          />
        </div>
        <div class="flex justify-center items-center">
          <NuxtLink
            to="/configuration/custom-agents"
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
        <div class="mb-4">
          <CustomAgentEditEmail :custom-agent="customAgent" @update:customAgent="getData" />
        </div>
        <div class="mb-4">
          <CustomAgentBankForm :id="id.toString()" />
        </div>
      </div>
    </div>

    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="saveCustomAgent" />
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/customAgentForm'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const loadingStore = useLoadingStore()

const similarItems = ref<any[]>([])
const showSimilarDialog = ref(false)

const id = route.params.id!

const customAgent = ref<any>({
  name: '',
  patente: '',
  agencia: '',
  ports: [],
})
const catalogs = ref({
  ports: [] as any,
})

const getCustomAgentCatalogs = async () => {
  const response = await $api.customAgents.getCatalogs()

  catalogs.value = response as any
}

const fetchSimilarAgents = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.customAgents.searchByName({ name: values.name })
    const items = Array.isArray(response) ? response : []
    similarItems.value = items.filter((agent: any) => String(agent.id) !== String(id))
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

  await fetchSimilarAgents()
  if (similarItems.value.length === 0) {
    saveCustomAgent()
    return
  }
  showSimilarDialog.value = true
}

const getData = async () => {
  const response = (await $api.customAgents.getById(id.toString())) as any
  const portsWithIds = response.ports.map((port: any) => port.id)
  customAgent.value = response
  customAgent.value.ports = portsWithIds
  console.log(customAgent.value)
  setValues(customAgent.value)
}

const { handleSubmit, values, errors, meta, setValues } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  await $api.customAgents.update(id!.toString(), values)
  snackbar.add({ type: 'success', text: 'Custom agent updated' })
  router.push('/configuration/custom-agents')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const saveCustomAgent = handleSubmit(onSuccess, onInvalidSubmit)

onMounted(async () => {
  await getCustomAgentCatalogs()
  await getData()
})
</script>
