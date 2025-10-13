<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText name="name" label="Name Group*" density="compact" />
        </div>
        <div>
          <InputText name="code" label="Code" density="compact" />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/customers/groups"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>

      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="fetchSimilarCustomerGroups"> Search similar </v-btn>
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
import { schema } from '~~/forms/consigneegroupForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const similarItems = ref<any>([])
const showSimilarDialog = ref(false)

const { handleSubmit, values, errors, meta, handleReset } = useForm({
  validationSchema: schema,
})

const fetchSimilarCustomerGroups = async () => {
  try {
    loadingStore.loading = true
    const body = { name: values.name }
    const response = await $api.consigneeGroups.searchByName(body)
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
  await fetchSimilarCustomerGroups()
  showSimilarDialog.value = true
}

const onSuccess = async (values: any) => {
  await $api.consigneeGroups.create(values)

  snackbar.add({ type: 'success', text: 'Consignee group created' })
  router.push('/configuration/customers/groups')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
