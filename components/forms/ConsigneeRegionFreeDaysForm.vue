<template>
  <v-card color="" class="mb-4">
    <v-card-title>
      <div class="flex justify-between items-center">
        <div>Region Free Days Configuration</div>
        <div>
          <v-btn icon="mdi-plus" size="x-small" color="success" @click="toggleForm"></v-btn>
        </div>
      </div>
    </v-card-title>
    <v-card-text>
      <div v-if="showForm" class="bg-slate-100 dark:bg-neutral-800 p-4 rounded-lg mb-4">
        <div class="grid grid-cols-3 gap-2">
          <div>
            <v-autocomplete
              v-model="form.sea_region_id"
              label="Sea Region *"
              :items="seaRegions"
              item-value="id"
              item-title="name"
              variant="solo-filled"
              density="compact"
              hide-details
              :disabled="!!form.id"
            />
          </div>
          <div>
            <v-text-field
              v-model="form.import_free_days"
              label="Import Free Days"
              type="number"
              variant="solo-filled"
              density="compact"
              hide-details
            />
          </div>
          <div>
            <v-text-field
              v-model="form.export_free_days"
              label="Export Free Days"
              type="number"
              variant="solo-filled"
              density="compact"
              hide-details
            />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <v-btn color="secondary" size="small" @click="cancelForm">Cancel</v-btn>
          <v-btn color="primary" size="small" @click="saveRegionFreeDays">
            {{ form.id ? 'Update' : 'Save' }}
          </v-btn>
        </div>
      </div>

      <v-table density="compact" v-if="regionFreeDays.length > 0">
        <thead>
          <tr>
            <th class="text-left">Actions</th>
            <th class="text-left">Region</th>
            <th class="text-left">Import Free Days</th>
            <th class="text-left">Export Free Days</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in regionFreeDays" :key="`region-free-days-${index}`">
            <td>
              <div class="flex gap-2">
                <v-btn
                  size="small"
                  variant="text"
                  icon="mdi-pencil-outline"
                  color="primary"
                  density="compact"
                  @click="editRegionFreeDays(item)"
                ></v-btn>
                <v-btn
                  size="small"
                  variant="text"
                  icon="mdi-delete-outline"
                  color="red-lighten-2"
                  density="compact"
                  @click="confirmDelete(item.id)"
                ></v-btn>
              </div>
            </td>
            <td>{{ item.sea_region?.name || 'N/A' }}</td>
            <td>{{ item.import_free_days }}</td>
            <td>{{ item.export_free_days }}</td>
          </tr>
        </tbody>
      </v-table>
      <div v-else class="text-center text-gray-500 py-4">
        No region free days configured. Click the + button to add one.
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  id: string
}>()

const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const showForm = ref(false)
const seaRegions = ref<any[]>([])
const regionFreeDays = ref<any[]>([])

const form = reactive({
  id: null as number | null,
  sea_region_id: null as number | null,
  import_free_days: 0,
  export_free_days: 0,
})

const resetForm = () => {
  form.id = null
  form.sea_region_id = null
  form.import_free_days = 0
  form.export_free_days = 0
}

const toggleForm = () => {
  if (showForm.value) {
    resetForm()
  }
  showForm.value = !showForm.value
}

const cancelForm = () => {
  resetForm()
  showForm.value = false
}

const editRegionFreeDays = (item: any) => {
  form.id = item.id
  form.sea_region_id = item.sea_region_id
  form.import_free_days = item.import_free_days
  form.export_free_days = item.export_free_days
  showForm.value = true
}

const saveRegionFreeDays = async () => {
  try {
    if (!form.sea_region_id) {
      snackbar.add({ type: 'warning', text: 'Please select a sea region' })
      return
    }

    loadingStore.start()
    await $api.consignees.upsertRegionFreeDays(props.id, form)
    snackbar.add({ type: 'success', text: 'Region free days saved successfully' })
    await getData()
    cancelForm()
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e.message || 'Error saving region free days' })
  } finally {
    loadingStore.stop()
  }
}

const confirmDelete = async (regionFreeDaysId: number) => {
  const result = await confirm({
    title: 'Delete Region Free Days?',
    confirmationText: 'Delete',
    content: 'Are you sure you want to delete this region free days configuration?',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'error',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.consignees.deleteRegionFreeDays(regionFreeDaysId.toString())
      snackbar.add({ type: 'success', text: 'Region free days deleted successfully' })
      await getData()
    } catch (e: any) {
      console.error(e)
      snackbar.add({ type: 'error', text: e.message || 'Error deleting region free days' })
    } finally {
      loadingStore.stop()
    }
  }
}

const getSeaRegions = async () => {
  try {
    const response = await $api.consignees.getSeaRegionsForFreeDays()
    seaRegions.value = response as any[]
  } catch (e) {
    console.error(e)
  }
}

const getData = async () => {
  try {
    const response = await $api.consignees.getRegionFreeDays(props.id)
    regionFreeDays.value = response as any[]
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  await getSeaRegions()
  await getData()
})
</script>
