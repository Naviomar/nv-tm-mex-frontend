<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div>
          <InputText density="compact" name="gaffette" label="Gaffette *" />
        </div>

        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/handlers"> Cancel </v-btn>
          <v-btn color="primary" @click="saveCharge"> Save </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/handlerForm'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

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
      const response = (await $api.handlers.getById(id)) as any
      setValues(response)
    }
  },
  { immediate: true }
)

const catalogs = ref<any>({
  countries: [],
})

const { handleSubmit, setValues } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  if (props.id) {
    await $api.handlers.update(props.id, values)
    snackbar.add({ type: 'success', text: 'Air handler updated' })
    router.push('/configuration/handlers')
    return
  }

  if (!props.id) {
    await $api.handlers.create(values)
    snackbar.add({ type: 'success', text: 'Air handler created' })
    router.push('/configuration/handlers')
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const saveCharge = handleSubmit(onSuccess, onInvalidSubmit)

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = await $api.handlers.getFormCatalogs()

    catalogs.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  // await getCatalogs()
})
</script>
