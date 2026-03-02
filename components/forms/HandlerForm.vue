<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div>
          <InputText density="compact" name="gaffette" label="Gaffette *" />
        </div>

        <div class="flex justify-center items-center">
          <NuxtLink
            to="/configuration/handlers"
            class="mr-4 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
          >
            Cancel
          </NuxtLink>
          <button
            type="button"
            @click="saveCharge"
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/handlerForm'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()

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
      const response = (await $api.handlers.getById(id)) as any
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
    await $api.handlers.update(props.id, values)
    snackbar.add({ type: 'success', text: 'Air handler updated' })
    router.push('/configuration/handlers')
    return
  }

  if (!props.id) {
    await $api.handlers.create(values)
    snackbar.add({ type: 'success', text: 'Air handler created' })
    router.push('/configuration/handlers')
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const saveCharge = handleSubmit(onSuccess, onInvalidSubmit)

onMounted(async () => {
  // await getCatalogs()
})
</script>
