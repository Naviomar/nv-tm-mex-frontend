<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div class="mb-4">
          <InputText density="compact" name="name" label="Name *" />
          <v-btn color="primary" size="small" @click="searchSuppliersByName"> Search similar </v-btn>
          <div v-if="hasSimilarSuppliers" class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2">
            <div class="text-sm font-bold">Suppliers with similar name:</div>
            <div class="max-h-96 overflow-y-auto">
              <div v-for="supplier in similiarSuppliers" :key="supplier.id" class="p-1">
                {{ supplier.name }} #{{ supplier.id }}
              </div>
            </div>
          </div>
        </div>
        <div>
          <InputAutocomplete
            name="supplier_type_id"
            label="Supplier type"
            :items="catalogs.supplierTypes"
            item-value="id"
            item-title="name"
            density="compact"
          />
        </div>
        <div>
          <InputText density="compact" type="number" name="credit_days" label="Credit days *" />
        </div>
        <div>
          <InputText density="compact" name="tax_number" label="RFC *" />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/suppliers"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>
      <div class="col-span-6">
        <div class="mb-4">
          <SupplierBankForm v-if="$props.id != null" :id="props.id" />
        </div>
        <div class="mb-4">
          <SupplierAddressForm v-if="$props.id != null" :id="props.id!" />
        </div>
        <div class="mb-4">
          <SupplierEmailsForm v-if="$props.id != null" :supplier="values" @refresh="getSupplier" />
        </div>
      </div>
    </div>

    <SimilarItemsDialog
      v-model="showSimilarDialog"
      :similar-items="similiarSuppliers"
      @proceed="confirmCreateSupplier"
    />
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/supplierForm'

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

const catalogs = ref<any>({
  countries: [],
  supplierTypes: [],
})

const similiarSuppliers = ref<any>([])
const showSimilarDialog = ref(false) // Controls dialog visibility

const hasSimilarSuppliers = computed(() => similiarSuppliers.value.length > 0)

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const validateBeforeCreate = async () => {
  if (!values.name || values.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }
  await searchSuppliersByName()
  showSimilarDialog.value = true
}

const confirmCreateSupplier = () => {
  saveSupplier()
}

const onSuccess = async (values: any) => {
  if (props.id) {
    await $api.suppliers.update(props.id, values)
    snackbar.add({ type: 'success', text: 'Supplier updated' })
    router.push('/configuration/suppliers')
    return
  }

  if (!props.id) {
    await $api.suppliers.create(values)
    snackbar.add({ type: 'success', text: 'Supplier created' })
    router.push('/configuration/suppliers')
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const saveSupplier = handleSubmit(onSuccess, onInvalidSubmit)

const getSupplier = async () => {
  try {
    loadingStore.start()
    const response = (await $api.suppliers.getById(props.id!.toString())) as any
    setValues(response)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const searchSuppliersByName = async () => {
  try {
    loadingStore.loading = true
    const body = {
      name: values.name,
    }
    const response = await $api.suppliers.searchByName(body)
    similiarSuppliers.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = await $api.suppliers.formCatalogs()
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
  await getCatalogs()
  // const response = await $api.countries.getAll()
  // catalogs.value.countries = response
})

watch(
  () => props.id,
  async (id) => {
    if (id) {
      await getSupplier()
    }
  },
  { immediate: true }
)
</script>
