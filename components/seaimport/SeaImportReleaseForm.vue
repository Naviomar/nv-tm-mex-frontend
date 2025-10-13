<template>
  <div>
    <div>
      <div class="font-bold flex items-center">
        Release
        <UserInfoBadge v-if="form?.created_by" :item="form" />
      </div>
      <VeeForm
        @submit="onClickSaveRelease"
        :validation-schema="schemaReleaseAgent"
        :init-values="form"
        ref="releaseAgentFormRef"
      >
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Release line</th>
              <th class="text-left">Release date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <InputText name="release_line_date" density="compact" type="date" label="Release line *" />
              </td>
              <td>
                <InputText name="release_date" density="compact" type="date" label="Release date *" />
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <InputAutocomplete
                  name="release_agent_id"
                  density="compact"
                  :items="customAgents"
                  :item-title="(row: any) => `${row.name} - Patente: ${row.patente}`"
                  item-value="id"
                  label="Customs Agent *"
                />
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <InputTextArea name="notes" density="compact" :rows="2" :counter="3000" label="Notes" />
              </td>
            </tr>
          </tbody>
        </v-table>
        <div class="flex justify-center">
          <v-btn size="small" color="primary" type="submit">Update release</v-btn>
        </div>
      </VeeForm>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schemaReleaseAgent } from '~~/forms/maritimeReferenceForm'
import VeeForm from '@/components/global/VeeForm.vue'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  referenceId: {
    type: String,
    required: true,
  },
})

const releaseAgentFormRef = ref<InstanceType<typeof VeeForm> | null>(null)

const form = ref<any>({
  release_date: null,
  release_line_date: null,
  release_agent_id: null,
  notes: null,
})

const customAgents = ref<any>([])

const onClickSaveRelease = async (values: any) => {
  try {
    loadingStore.start()
    const body = {
      referencia_id: props.referenceId,
      ...values,
    }
    await $api.referencias.updateSeaImportReleaseInfo(props.referenceId, body)
    snackbar.add({ type: 'success', text: 'Release updated' })
    await getRelaseSeaImport()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getRelaseSeaImport = async () => {
  try {
    loadingStore.start()
    const response = await $api.referencias.getSeaImportReleaseInfo(props.referenceId)
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

const getCustomAgents = async () => {
  try {
    loadingStore.start()
    const response = await $api.customAgents.getAll()
    customAgents.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getCustomAgents()
  await getRelaseSeaImport()
})
</script>
