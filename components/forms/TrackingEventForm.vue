<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputAutocomplete
            name="type"
            density="compact"
            :items="types"
            item-title="name"
            item-value="value"
            label="Type *"
          />
        </div>
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div>
          <InputText density="compact" name="description" label="Description" />
        </div>

        <div class="flex justify-center items-center mt-4">
          <v-btn class="mr-4" color="secondary" to="/configuration/tracking-events"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>

      <div class="col-span-6">
        <v-btn color="primary" size="small" @click="fetchSimilarEvents"> Search similar </v-btn>

        <div
          v-if="similarItems.length > 0"
          class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2 rounded"
        >
          <div class="text-sm font-bold mb-2">Tracking events with similar name:</div>
          <div class="max-h-96 overflow-y-auto">
            <div v-for="event in similarItems" :key="event.id" class="p-1">{{ event.name }} #{{ event.id }}</div>
          </div>
        </div>
      </div>
    </div>

    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similarItems" @proceed="saveTrackingEvent" />
  </div>
</template>

<script setup lang="ts">
import { schema } from '~~/forms/trackingEventForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const similarItems = ref<any>([])
const showSimilarDialog = ref(false)

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
      const response = (await $api.trackingEvents.getById(id)) as any
      setValues(response)
    }
  },
  { immediate: true }
)

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
})

const types = [
  { name: 'Sea', value: 'sea' },
  { name: 'Air', value: 'air' },
]

const fetchSimilarEvents = async () => {
  try {
    loadingStore.loading = true
    const body = { name: values.name }
    const response = await $api.trackingEvents.searchByName(body)
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
  if (!values.name || values.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }
  await fetchSimilarEvents()
  showSimilarDialog.value = true
}

const onSuccess = async (formValues: any) => {
  if (props.id) {
    await $api.trackingEvents.update(props.id, formValues)
    snackbar.add({ type: 'success', text: 'Tracking event updated' })
  } else {
    await $api.trackingEvents.create(formValues)
    snackbar.add({ type: 'success', text: 'Tracking event created' })
  }
  router.push('/configuration/tracking-events')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Please fill in all required fields' })
}

const saveTrackingEvent = handleSubmit(onSuccess, onInvalidSubmit)
</script>
