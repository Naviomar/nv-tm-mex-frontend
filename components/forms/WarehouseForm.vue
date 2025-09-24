<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>

        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/warehouses"> Cancel </v-btn>
          <v-btn color="primary" @click="saveCharge"> Save </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/warehouseForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
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
      const response = (await $api.warehouses.getById(id)) as any
      setValues(response)
    }
  },
  { immediate: true }
)

const { handleSubmit, setValues } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  if (props.id) {
    await $api.warehouses.update(props.id, values)
    snackbar.add({ type: 'success', text: 'Warehouse updated' })
    router.push('/configuration/warehouses')
    return
  }

  if (!props.id) {
    await $api.warehouses.create(values)
    snackbar.add({ type: 'success', text: 'Warehouse created' })
    router.push('/configuration/warehouses')
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'error', text: 'Please fill all required fields' })
}

const saveCharge = handleSubmit(onSuccess, onInvalidSubmit)
</script>
