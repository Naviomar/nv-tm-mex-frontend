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
            name="ports"
            :items="mexicanPorts"
            item-title="name"
            item-value="id"
            label="Ports"
            :multiple="true"
          />
        </div>

        <div class="flex justify-center items-center mt-4">
          <v-btn class="mr-4" color="secondary" to="/configuration/custom-agents"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>

      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="fetchSimilarAgents"> Search similar </v-btn>

        <div
          v-if="similarItems.length > 0"
          class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2 rounded"
        >
          <div class="text-sm font-bold mb-2">Custom agents with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="agent in similarItems" :key="agent.id" class="p-1">{{ agent.name }} #{{ agent.id }}</div>
          </div>
        </div>
      </div>
    </div>

    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="saveCustomAgent" />
  </div>
</template>

<script setup lang="ts">
import { schema } from '~~/forms/customAgentForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const similarItems = ref<any[]>([])
const showSimilarDialog = ref(false)

const catalogs = ref({
  ports: [] as any,
})

const mexicanPorts = computed(() => {
  if (!catalogs.value.ports) return []
  return catalogs.value.ports.filter((port: any) => port.country?.code === 'MX')
})

const getCustomAgentCatalogs = async () => {
  const response: any = await $api.customAgents.getCatalogs()
  catalogs.value = response
}

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

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

const onSuccess = async (formValues: any) => {
  await $api.customAgents.create(formValues)
  snackbar.add({ type: 'success', text: 'Customs agent created' })
  router.push('/configuration/custom-agents')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values, errors, results)
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const saveCustomAgent = handleSubmit(onSuccess, onInvalidSubmit)

await getCustomAgentCatalogs()
</script>
