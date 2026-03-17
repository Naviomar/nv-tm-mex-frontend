<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div>
          <InputText density="compact" name="legal_name" label="Legal name" />
        </div>
        <div>
          <InputText density="compact" name="tax_number" label="Tax number" />
        </div>
        <div>
          <InputText density="compact" name="contact_name" label="Contact name" />
        </div>
        <div>
          <InputText density="compact" name="email" label="Email" />
        </div>
        <div>
          <InputText density="compact" name="phone" label="Phone" />
        </div>
        <div>
          <InputAutocomplete
            density="compact"
            name="country_id"
            :items="catalogs.countries"
            item-title="name"
            item-value="id"
            label="Country"
          />
        </div>
        <div>
          <InputSwitch density="compact" name="is_active" label="Active" class="mx-4" />
        </div>
        <div>
          <InputTextArea density="compact" name="notes" label="Notes" />
        </div>
        <div class="flex justify-center items-center">
          <NuxtLink
            to="/configuration/beneficiaries"
            class="mr-4 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
          >
            Cancel
          </NuxtLink>
          <button
            type="button"
            @click="validateBeforeCreate"
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Save
          </button>
        </div>
      </div>
      <div class="col-span-6">
        <div class="mb-4">
          <BeneficiaryBankForm :id="id.toString()" />
        </div>
      </div>
    </div>

    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="saveBeneficiary" />
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/beneficiaryForm'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const loadingStore = useLoadingStore()

const similarItems = ref<any[]>([])
const showSimilarDialog = ref(false)

const id = route.params.id!

const beneficiary = ref<any>({
  name: '',
  legal_name: '',
  tax_number: '',
  contact_name: '',
  email: '',
  phone: '',
  country_id: null,
  notes: '',
  is_active: true,
})
const catalogs = ref({
  countries: [] as any[],
})

const getCatalogs = async () => {
  const response = await $api.beneficiaries.getCatalogs()
  catalogs.value = response as any
}

const fetchSimilarBeneficiaries = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.beneficiaries.searchByName({ name: values.name })
    const items = Array.isArray(response) ? response : []
    similarItems.value = items.filter((item: any) => String(item.id) !== String(id))
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const validateBeforeCreate = async () => {
  if (!values?.name) {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }

  await fetchSimilarBeneficiaries()
  if (similarItems.value.length === 0) {
    saveBeneficiary()
    return
  }
  showSimilarDialog.value = true
}

const getData = async () => {
  const response = (await $api.beneficiaries.getById(id.toString())) as any
  beneficiary.value = response
  setValues(beneficiary.value)
}

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  await $api.beneficiaries.update(id.toString(), values)
  snackbar.add({ type: 'success', text: 'Beneficiary updated' })
  router.push('/configuration/beneficiaries')
}

function onInvalidSubmit() {
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const saveBeneficiary = handleSubmit(onSuccess, onInvalidSubmit)

onMounted(async () => {
  await getCatalogs()
  await getData()
})
</script>
