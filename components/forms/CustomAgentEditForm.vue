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
          <v-btn class="mr-4" color="secondary" to="/configuration/custom-agents"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
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

  await fetchSimilarAgents()
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
  const response = await $api.customAgents.update(id!.toString(), values)
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
