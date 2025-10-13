<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <!-- Formulario principal -->
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div>
          <InputText density="compact" name="tax_number" label="RFC" />
        </div>
        <div>
          <InputText density="compact" name="contact_name" label="Contact Name *" />
        </div>
        <div>
          <InputText density="compact" name="contact_phone" label="Contact Phone *" />
        </div>
        <div>
          <InputAutocomplete
            name="country_id"
            label="Country"
            :items="catalogs.countries"
            item-value="id"
            item-title="name"
            density="compact"
          />
        </div>
        <div>
          <InputAutocomplete
            name="freight_group_id"
            label="Freight group"
            :items="catalogs.freightGroups"
            item-value="id"
            item-title="name"
            density="compact"
          />
        </div>
        <div>
          <InputTextArea density="compact" name="address" label="Address" />
        </div>
        <div>
          <InputText density="compact" name="state" label="State" />
        </div>
        <div>
          <InputText density="compact" name="zip_code" label="Zip code" />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/freight-forwarders"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>

      <!-- Columna de similares -->
      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="searchFreightForwarderByName"> Search similar </v-btn>
        <div v-if="hasSimilarNames" class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2">
          <div class="text-sm font-bold">Freight forwarders with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="item in similarNames" :key="item.id" class="p-1">{{ item.name }} #{{ item.id }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <SimilarItemsDialog
      v-model="showSimilarDialog"
      :similar-items="similarNames"
      :current-name="values.name"
      @proceed="saveFreightForwarder"
    />
  </div>
</template>

<script setup lang="ts">
import { schema } from '~~/forms/freightforwarderForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const catalogs = ref({
  countries: [] as any,
  freightGroups: [] as any,
})

// ---- Similares ----
const similarNames = ref<any>([])
const showSimilarDialog = ref(false)
const hasSimilarNames = computed(() => similarNames.value.length > 0)

// Buscar similares por nombre
const searchFreightForwarderByName = async () => {
  try {
    loadingStore.loading = true
    const body = { name: values.name }
    const response = await $api.freightForwarders.searchByName(body)
    similarNames.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

// Validar antes de guardar
const validateBeforeCreate = async () => {
  if (!values.name || values.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }
  await searchFreightForwarderByName()
  showSimilarDialog.value = true
}

// Guardar
const onSuccess = async (values: any) => {
  await $api.freightForwarders.create(values)
  snackbar.add({ type: 'success', text: 'Freight forwarder created' })
  router.push('/configuration/freight-forwarders')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Please fill in all required fields' })
}

const saveFreightForwarder = handleSubmit(onSuccess, onInvalidSubmit)

// Catálogos
const getFreightCatalogs = async () => {
  const response = await $api.freightForwarders.getCatalogs()
  catalogs.value = response as any
}
await getFreightCatalogs()
</script>
