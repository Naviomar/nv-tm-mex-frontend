<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Container name *" />
        </div>
        <div>
          <InputText density="compact" name="code" label="Code *" />
        </div>
        <div>
          <InputText density="compact" type="number" name="teus" label="Teus *" />
        </div>
        <div>
          <InputAutocomplete
            name="is_reefer"
            :items="reeferValues"
            item-title="name"
            item-value="value"
            label="Reefer"
            density="compact"
          />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/containers"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>
      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="searchContainersByName"> Search similar </v-btn>
        <div v-if="hasSimilars" class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2">
          <div class="text-sm font-bold">Containers with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="container in similars" :key="container.id" class="p-1">
              {{ container.name }} #{{ container.id }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similars" @proceed="saveContainer" />
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/containerForm'

const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const router = useRouter()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
})

const similars = ref<any>([])
const showSimilarDialog = ref(false) // Controls dialog visibility
const hasSimilars = computed(() => similars.value.length > 0)

watch(
  () => props.id,
  async (id) => {
    if (id) {
      const response = (await $api.containers.getById(id)) as any
      setValues(response)
    }
  },
  { immediate: true }
)

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const reeferValues = [
  {
    name: 'Yes',
    value: 1,
  },
  {
    name: 'No',
    value: 0,
  },
]

const searchContainersByName = async () => {
  try {
    loadingStore.loading = true
    const body = {
      name: values.name,
    }
    const response = await $api.containers.searchByName(body)
    similars.value = response
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
  await searchContainersByName()
  showSimilarDialog.value = true
}

const onSuccess = async (values: any) => {
  if (props.id) {
    await $api.containers.update(props.id, values)
    snackbar.add({ type: 'success', text: 'Container updated' })
    router.push('/configuration/containers')
    return
  }

  if (!props.id) {
    await $api.containers.create(values)
    snackbar.add({ type: 'success', text: 'Container created' })
    router.push('/configuration/containers')
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'error', text: 'Please fill in all required fields' })
}
const saveContainer = handleSubmit(onSuccess, onInvalidSubmit)
</script>
