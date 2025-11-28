<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText name="name" label="Group name *" density="compact" required />
        </div>
        <div class="flex justify-start items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/freight-forwarders/groups"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>

      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="fetchSimilarfreightForwardersGroups"> Search similar </v-btn>
        <div
          v-if="similarItems.length > 0"
          class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2 rounded"
        >
          <div class="text-sm font-bold mb-2">Freight Forwarders Groups with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="freight in similarItems" :key="freight.id" class="p-1">
              {{ freight.name }} #{{ freight.id }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="save" />
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/freightforwarderGroupForm'

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
      const response = (await $api.freightForwardersGroups.getById(id)) as any
      setValues(response)
    }
  }
)
const { handleSubmit, values, errors, meta, handleReset, setValues } = useForm({
  validationSchema: schema,
})

const fetchSimilarfreightForwardersGroups = async () => {
  try {
    loadingStore.loading = true
    const body = { name: values.name }
    const response = await $api.freightForwardersGroups.searchByName(body)
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
    return false
  }
  await fetchSimilarfreightForwardersGroups()
  showSimilarDialog.value = true
}
const onSuccess = async (formvalues: any) => {
  if (props.id) {
    await $api.freightForwardersGroups.update(props.id, formvalues)
    snackbar.add({ type: 'success', text: 'freightforwarder group created' })
  } else {
    await $api.freightForwardersGroups.create(formvalues)
    snackbar.add({ type: 'success', text: 'freightforwarder group created' })
  }
  router.push('/configuration/freight-forwarders/groups')
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values)
  console.log(errors)
  console.log(results)
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
