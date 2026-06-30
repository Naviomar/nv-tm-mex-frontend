<template>
  <div>
    <!-- Basic info form -->
    <v-card variant="flat" class="mb-4 rounded-lg" bg-color="grey-lighten-5">
      <v-card-text class="pa-4">
        <div class="d-flex align-center gap-2 mb-4">
          <v-avatar color="primary" size="32" rounded="lg">
            <v-icon size="18" color="white">mdi-office-building</v-icon>
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold">Department Information</div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <InputText density="compact" name="name" label="Name *" variant="outlined" />
          <InputText density="compact" name="description" label="Description" variant="outlined" />
        </div>
        <div class="flex gap-3">
          <v-btn color="secondary" variant="tonal" to="/system/departments">Cancel</v-btn>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-content-save" @click="saveCharge">Save</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Admin form: only shown when editing an existing department -->
    <DepartmentAdminForm v-if="props.id" :id="props.id" />
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/departmentForm'

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

const { handleSubmit, setValues } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  if (props.id) {
    await $api.departments.update(props.id, values)
    snackbar.add({ type: 'success', text: 'Department updated' })
    router.push('/system/departments')
    return
  }
  await $api.departments.create(values)
  snackbar.add({ type: 'success', text: 'Department created' })
  router.push('/system/departments')
}

const saveCharge = handleSubmit(
  onSuccess,
  () => snackbar.add({ type: 'error', text: 'Please fill all required fields' })
)

async function loadDepartment(id: string) {
  try {
    loadingStore.start()
    const response = (await $api.departments.getById(id)) as any
    setValues(response)
  } catch (e) {
    console.error(e)
  } finally {
    loadingStore.stop()
  }
}

watch(
  () => props.id,
  async (id) => { if (id) await loadDepartment(id) },
  { immediate: true }
)
</script>
