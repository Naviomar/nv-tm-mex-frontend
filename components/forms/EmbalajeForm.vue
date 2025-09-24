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
          <v-btn class="mr-4" color="secondary" to="/configuration/embalajes"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>

      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="fetchSimilarEmbalajes"> Search similar </v-btn>

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
    similarsItems.value = response
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
