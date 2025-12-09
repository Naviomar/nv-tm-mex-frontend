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
                  item-title="full_name"
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
        <v-alert
          v-if="agentChanged"
          type="warning"
          variant="tonal"
          class="mt-4 mb-4"
          border="start"
          prominent
        >
          <div class="font-bold mb-1">Customs agent change detected</div>
          <p>
            Changing the customs agent will generate an additional charge of
            <strong>$150 USD</strong> the next time the electronic revalidation is redone.
          </p>
          <p class="mt-1 text-sm">
            If this is only a data-entry correction and there is no real change of customs agent, you may request a
            supervisor authorization to skip this charge.
          </p>
        </v-alert>

        <div v-if="agentChanged && canSkipAgentChangeCharge" class="mb-4">
          <v-alert type="info" density="compact" class="mb-2">
            <div class="text-sm">
              Skipping the customs agent change charge requires an authorization.
              Please request authorization if this change should not generate the charge.
            </div>
          </v-alert>
          <AuthorizeProcessSmart
            :resource="authorizeResources.RevalidationSkipAgentChangeCharge.resource"
            :resourceId="String(props.referenceId)"
            label="Request authorization to skip customs agent change charge"
            :refresh="refreshAuthReqs"
          >
            <template #auth>
              <v-chip color="success" size="small">
                <v-icon>mdi-check</v-icon>
                Authorized - charge can be skipped on redo
              </v-chip>
            </template>
          </AuthorizeProcessSmart>
        </div>
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
import { authorizeResources } from '~/utils/data/system'
import AuthorizeProcessSmart from '@/components/autorizacion/AuthorizeProcessSmart.vue'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { user } = useCheckUser()

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

const previousAgent = ref<string | null>(null)
const refreshAuthReqs = ref(false)

const canSkipAgentChangeCharge = computed(() => {
  const permissionName = 'revalidation-skip-agent-change-charge'
  const hasDirectPermission = user.value?.permissions?.some((p: any) => p.name === permissionName) ?? false
  const hasRolePermission =
    user.value?.roles?.some((role: any) => role.permissions?.some((p: any) => p.name === permissionName)) ?? false
  return hasDirectPermission || hasRolePermission
})

const currentAgentShortName = computed(() => {
  if (!form.value?.release_agent_id) return null
  const agent = customAgents.value.find((a: any) => a.id === form.value.release_agent_id)
  return agent?.short_name ?? null
})

const agentChanged = computed(() => {
  return !!(previousAgent.value && currentAgentShortName.value && previousAgent.value !== currentAgentShortName.value)
})

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

const loadPreviousAgent = async () => {
  try {
    loadingStore.start()
    const response = await $api.referencias.getChecklistRevalidation(props.referenceId)
    previousAgent.value = (response as any)?.agente_aduanal ?? null
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
  await loadPreviousAgent()
})
</script>
