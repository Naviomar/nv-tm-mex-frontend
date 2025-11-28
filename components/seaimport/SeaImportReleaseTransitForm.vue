<template>
  <div>
    <div>
      <div class="font-bold flex items-center">
        Release in transit
        <UserInfoBadge v-if="form?.created_by" :item="form" />
      </div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">Release date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <v-text-field v-model="form.instruction_date" density="compact" type="date" label="Release date" />
            </td>
          </tr>
        </tbody>
      </v-table>
      <div class="flex justify-center">
        <v-btn size="small" color="primary" @click="onClickSaveTransit">Update release in transit</v-btn>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  referenceId: {
    type: String,
    required: true,
  },
})

const form = ref<any>({
  instruction_date: null,
})

const onClickSaveTransit = async () => {
  try {
    if (!form.value.instruction_date) {
      snackbar.add({ type: 'error', text: 'Please fill all the fields' })
      return
    }
    loadingStore.start()
    const body = {
      referencia_id: props.referenceId,
      instruction_date: form.value.instruction_date,
    }
    const response = await $api.referencias.updateSeaImportReleaseInTransit(props.referenceId, body)
    snackbar.add({ type: 'success', text: 'Release in transit updated' })
    await getRelaseTransitSeaImport()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getRelaseTransitSeaImport = async () => {
  try {
    loadingStore.start()
    const response = await $api.referencias.getSeaImportReleaseTransitInfo(props.referenceId)
    if (!response) return
    form.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getRelaseTransitSeaImport()
})
</script>
