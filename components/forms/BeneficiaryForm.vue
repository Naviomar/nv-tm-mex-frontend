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
            name="country_id"
            :items="catalogs.countries"
            item-title="name"
            item-value="id"
            label="Country"
            density="compact"
          />
        </div>
        <div>
          <InputSwitch density="compact" name="is_active" label="Active" class="mx-4" />
        </div>
        <div>
          <InputTextArea density="compact" name="notes" label="Notes" />
        </div>

        <div class="flex justify-center items-center mt-4">
          <v-btn class="mr-4" color="secondary" to="/configuration/beneficiaries"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>

      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="fetchSimilarBeneficiaries"> Search similar </v-btn>

        <div
          v-if="similarItems.length > 0"
          class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2 rounded"
        >
          <div class="text-sm font-bold mb-2">Beneficiaries with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="item in similarItems" :key="item.id" class="p-1">{{ item.name }} #{{ item.id }}</div>
          </div>
        </div>
      </div>
    </div>

    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="saveBeneficiary" />
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/beneficiaryForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const similarItems = ref<any[]>([])
const showSimilarDialog = ref(false)

const catalogs = ref({
  countries: [] as any[],
})

const getCatalogs = async () => {
  const response: any = await $api.beneficiaries.getCatalogs()
  catalogs.value = response
}

const { handleSubmit, values } = useForm({
  validationSchema: schema,
  initialValues: {
    is_active: true,
  },
})

const fetchSimilarBeneficiaries = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.beneficiaries.searchByName({ name: values.name })
    similarItems.value = Array.isArray(response) ? response : []
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
  showSimilarDialog.value = true
}

const onSuccess = async (formValues: any) => {
  await $api.beneficiaries.create(formValues)
  snackbar.add({ type: 'success', text: 'Beneficiary created' })
  router.push('/configuration/beneficiaries')
}

function onInvalidSubmit() {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const saveBeneficiary = handleSubmit(onSuccess, onInvalidSubmit)

await getCatalogs()
</script>
