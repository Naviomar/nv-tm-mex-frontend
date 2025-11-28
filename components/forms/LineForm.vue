<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputAutocomplete
            density="compact"
            name="line_type"
            :items="[
              { value: 'line', name: 'Freight Lines' },
              { value: 'agent', name: 'Freight Agents' },
            ]"
            item-title="name"
            item-value="value"
            label="Type *"
          />
        </div>
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div>
          <InputText density="compact" name="commercial_name" label="Commercial name *" />
        </div>
        <div>
          <InputText density="compact" name="contact_name" label="Contact Name" />
        </div>
        <div>
          <InputAutocomplete
            name="country_id"
            label="Country"
            :items="catalogs.countries"
            item-value="id"
            item-title="name"
            variant="solo-filled"
            density="compact"
          />
        </div>
        <div>
          <InputTextArea density="compact" name="address" label="Address" />
        </div>
        <div>
          <InputText density="compact" name="zip_code" label="Zip code" />
        </div>
        <div>
          <InputText density="compact" name="amacarga_code" label="Amacarga Code" hint="For Amacarga purposes" />
        </div>

        <!-- Botones -->
        <div class="flex justify-center items-center mt-4">
          <v-btn class="mr-4" color="secondary" to="/configuration/lines"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>

      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="fetchSimilarLines"> Search similar </v-btn>

        <div
          v-if="similarItems.length > 0"
          class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2 rounded"
        >
          <div class="text-sm font-bold mb-2">Lines with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="line in similarItems" :key="line.id" class="p-1">{{ line.name }} #{{ line.id }}</div>
          </div>
        </div>
      </div>
    </div>

    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="saveLine" />
  </div>
</template>

<script setup lang="ts">
import { schema } from '~~/forms/lineForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const similarItems = ref<any[]>([])
const showSimilarDialog = ref(false)

const catalogs = ref({
  countries: [] as any,
})

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const getLineCatalogs = async () => {
  const response = await $api.lines.getCatalogs()
  catalogs.value = response as any
}

const fetchSimilarLines = async () => {
  try {
    loadingStore.loading = true
    const body = { name: values.name }
    const response = await $api.lines.searchByName(body)
    similarItems.value = response
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

  await fetchSimilarLines()
  showSimilarDialog.value = true
}

const onSuccess = async (formValues: any) => {
  await $api.lines.create(formValues)
  snackbar.add({ type: 'success', text: 'Line created' })
  router.push('/configuration/lines')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Form has errors' })
}

const saveLine = handleSubmit(onSuccess, onInvalidSubmit)

await getLineCatalogs()
</script>
