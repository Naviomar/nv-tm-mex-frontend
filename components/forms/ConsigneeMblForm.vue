<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText name="name" label="Consignee name *" required density="compact" />
        </div>
        <div>
          <InputAutocomplete
            name="has_demurrages"
            label="Init demurrages? *"
            hint="Services will trigger demurrages process if consignee mbl linked."
            :items="[
              { name: 'Yes', value: true },
              { name: 'No', value: false },
            ]"
            item-title="name"
            item-value="value"
            density="compact"
          />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/consignees-mbl"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>

      <!-- Panel de similares -->
      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="fetchSimilarConsignees"> Search similar </v-btn>

        <div v-if="hasSimilars" class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2 rounded">
          <div class="text-sm font-bold mb-2">Consignees with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="item in similarItems" :key="item.id" class="p-1">{{ item.name }} #{{ item.id }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de similares -->
    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="saveConsigneeMbl" />
  </div>
</template>

<script setup lang="ts">
import { schema } from '~~/forms/consigneeMblForm'

const { $api } = useNuxtApp()
const router = useRouter()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
})

const similarItems = ref<any>([])
const showSimilarDialog = ref(false)
const hasSimilars = computed(() => similarItems.value.length > 0)

watch(
  () => props.id,
  async (id) => {
    if (id) {
      const response = (await $api.consigneeMbls.getById(id)) as any

      response.has_demurrages = Boolean(response.has_demurrages)

      setValues(response)
    }
  },
  { immediate: true }
)

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const fetchSimilarConsignees = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.consigneeMbls.searchByName({ name: values.name })
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

  await fetchSimilarConsignees()
  showSimilarDialog.value = true
}

const onSuccess = async (formValues: any) => {
  if (props.id) {
    await $api.consigneeMbls.update(props.id, formValues)
    snackbar.add({ type: 'success', text: 'Consignee MBL updated' })
  } else {
    await $api.consigneeMbls.create(formValues)
    snackbar.add({ type: 'success', text: 'Consignee MBL created' })
  }
  router.push('/configuration/consignees-mbl')
}

function onInvalidSubmit() {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const saveConsigneeMbl = handleSubmit(onSuccess, onInvalidSubmit)
</script>
