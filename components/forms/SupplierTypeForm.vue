<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <InputCheckbox density="compact" name="has_cap_limit" label="Cap limit" />
          </div>
          <div v-if="!hasCapLimit">
            <InputText density="compact" type="number" name="cap_limit" label="Cap limit" />
          </div>
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/suppliers/types"> Cancel </v-btn>
          <v-btn color="primary" @click="saveSupplierType"> Save </v-btn>
        </div>
      </div>
      <div class="col-span-6">
        <div class="font-bold">Suppliers linked</div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Supplier</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="values.suppliers?.length === 0">
              <td colspan="2" class="text-center">No suppliers linked</td>
            </tr>
            <tr v-for="(supplier, index) in values.suppliers" :key="`supplier-${index}`">
              <td>
                <div class="flex gap-2">
                  <TrashButton :item="supplier" />
                </div>
              </td>
              <td>{{ supplier.name }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/supplierTypeForm'

const router = useRouter()
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

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
      const response = (await $api.supplierTypes.getById(id)) as any
      setValues(response)
    }
  },
  { immediate: true }
)

const hasCapLimit = computed(() => {
  return values.has_cap_limit
})

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  if (props.id) {
    await $api.supplierTypes.update(props.id, values)
    snackbar.add({ type: 'success', text: 'Supplier type updated' })
    router.push('/configuration/suppliers/types')
    return
  }

  if (!props.id) {
    await $api.supplierTypes.create(values)
    snackbar.add({ type: 'success', text: 'Supplier type created' })
    router.push('/configuration/suppliers/types')
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const saveSupplierType = handleSubmit(onSuccess, onInvalidSubmit)

onMounted(async () => {})
</script>
