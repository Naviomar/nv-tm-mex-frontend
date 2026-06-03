<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputAutocomplete
            name="country_id"
            density="compact"
            :items="countries"
            item-title="name"
            item-value="id"
            label="Country"
          />
        </div>
        <div>
          <InputText density="compact" name="name" label="Port name *" />
        </div>
        <div>
          <InputText density="compact" name="code" label="Code *" />
        </div>
        <div>
          <InputText density="compact" name="city" label="City" />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/ports"> Cancel </v-btn>
          <v-btn color="primary" :disabled="loadingStore.loading" :loading="loadingStore.loading" @click="savePort"> Save </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/portForm'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const loadingStore = useLoadingStore()

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
      const response = (await $api.ports.getById(id)) as any
      setValues(response)
    }
  },
  { immediate: true }
)

const { handleSubmit, values, errors, meta, setValues } = useForm({
  validationSchema: schema,
})

const countries = ref<any>([])

const getCountries = async () => {
  const response = await $api.countries.getAll()

  countries.value = response as any
}

const onSuccess = async (values: any) => {
  try {
    loadingStore.loading = true
    if (props.id) {
      await $api.ports.update(props.id, values)
      snackbar.add({ type: 'success', text: 'Port updated' })
      router.push('/configuration/ports')
      return
    }
    await $api.ports.create(values)
    snackbar.add({ type: 'success', text: 'Port created' })
    router.push('/configuration/ports')
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'Error saving port'
    snackbar.add({ type: 'error', text: msg })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'error', text: 'Please fill all required fields' })
}
const savePort = handleSubmit(onSuccess, onInvalidSubmit)

onMounted(async () => {
  await getCountries()
})
</script>
