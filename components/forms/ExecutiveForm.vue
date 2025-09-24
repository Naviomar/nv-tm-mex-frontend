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
          <v-btn class="mr-4" color="secondary" to="/configuration/executives"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>

      <div v-if="values && id" class="col-span-6">
        <ExecutiveNotesForm :executive="values" />
      </div>

      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="fetchSimilarExecutives"> Search similar </v-btn>

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

  await fetchSimilarExecutives()
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
