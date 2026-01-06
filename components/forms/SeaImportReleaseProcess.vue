<template>
  <div class="mb-4">
    <!-- Dialog for customs agent change confirmation -->
    <v-dialog v-model="showAgentChangeDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-lg font-semibold bg-orange-500 text-white">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Customs agent change confirmation
        </v-card-title>
        <v-card-text class="pt-4">
          <div class="mb-4">
            <p class="text-base">
              When you redo the electronic revalidation, the system will compare the customs agent from the last
              checklist with the current release. If a change is detected, an additional charge of
              <strong>$150 USD</strong> will be generated.
            </p>
          </div>
          <v-alert v-if="agentChanged" type="warning" variant="tonal" class="mb-4" border="start" prominent>
            <div class="font-bold mb-2">Customs agent change detected</div>
            <p>
              A change of customs agent has been detected between the last checklist and the current release. Redoing
              the revalidation now will generate the "Customs Agent Change" charge in Local Charges.
            </p>
          </v-alert>
          <div v-if="agentChanged && canSkipAgentChangeCharge" class="mt-2">
            <v-checkbox
              v-model="skipAgentChangeCharge"
              density="compact"
              color="primary"
              hide-details
              label="This is a data entry correction. Do not generate the customs agent change charge (supervisor only)."
            />

            <div v-if="skipAgentChangeCharge" class="mt-4">
              <v-alert type="info" density="compact" class="mb-2">
                <div class="text-sm">
                  Skipping the customs agent change charge requires an authorization.
                  Please request authorization before proceeding.
                </div>
              </v-alert>
              <AuthorizeProcessSmart
                :resource="authorizeResources.RevalidationSkipAgentChangeCharge.resource"
                :resourceId="String(reference.id)"
                label="Request authorization to skip customs agent change charge"
                :refresh="refreshAuthReqs"
              >
                <template #auth>
                  <v-chip color="success" size="small">
                    <v-icon>mdi-check</v-icon>
                    Authorized - proceed
                  </v-chip>
                </template>
              </AuthorizeProcessSmart>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn variant="outlined" @click="cancelRedoRevalidation">Cancel</v-btn>
          <v-btn color="red-darken-2" variant="flat" @click="executeRedoRevalidation">
            Confirm and continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card density="compact">
      <v-toolbar density="compact" color="primary">
        <v-toolbar-title>
          <div class="flex items-center">
            <v-icon size="x-small">mdi-hand-okay</v-icon>
            <div class="ml-2 font-bold">Revalidation process</div>
          </div>
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text v-if="isLiverpoolMbl">
        <v-alert type="info" variant="tonal" border="start" prominent>
          <div class="font-bold mb-1">Revalidation notice</div>
          <div>Electronic revalidation is not applicable for master BL customers related to Liverpool.</div>
        </v-alert>
      </v-card-text>

      <div class="relative">
        <div
          :class="{
            'pointer-events-none opacity-40 blur-sm': isLiverpoolMbl,
          }"
        >
          <div v-if="!hasArrivalNotification">
            <v-card-text>
              <p>
                The arrival notification has not been completed. Please complete the arrival notification to start the
                revalidation process.
              </p>
            </v-card-text>
          </div>
          <div v-if="hasArrivalNotification">
            <v-tabs v-model="tab" class="tabs1">
              <v-tab value="option-0">
                <v-icon start> mdi-help-circle-outline </v-icon>
                About
              </v-tab>
              <v-tab value="option-1">
                <v-icon start> mdi-file </v-icon>
                Checklist revalidation
              </v-tab>
              <v-tab value="option-2">
                <v-icon start> mdi-transit-connection </v-icon>
                Release in transit
              </v-tab>
              <v-tab value="option-3">
                <v-icon start> mdi-transfer </v-icon>
                Release
              </v-tab>

              <v-tab value="option-4">
                <v-icon start> mdi-key-link </v-icon>
                Electronic revalidation
              </v-tab>
            </v-tabs>
            <v-window v-model="tab">
              <v-window-item value="option-0">
                <v-card flat>
                  <v-card-text>
                    <div class="font-bold">About</div>
                    <div class="mb-2">
                      The revalidation process is a series of steps that must be completed to release the cargo from the
                      customs warehouse.
                    </div>
                    <div class="mb-2">
                      The process includes the following steps:
                      <ul>
                        <li>Checklist revalidation</li>
                        <li>Release in transit</li>
                        <li>Release</li>
                        <li>Electronic revalidation</li>
                      </ul>
                    </div>
                  </v-card-text>
                </v-card>
              </v-window-item>
              <v-window-item value="option-1">
                <v-card flat>
                  <v-card-text>
                    <SeaImportCheckListRevalidation :reference="reference" />
                  </v-card-text>
                </v-card>
              </v-window-item>
              <v-window-item value="option-2">
                <v-card flat>
                  <v-card-text>
                    <SeaImportReleaseTransitForm :referenceId="reference.id" />
                  </v-card-text>
                </v-card>
              </v-window-item>
              <v-window-item value="option-3">
                <v-card flat>
                  <v-card-text>
                    <SeaImportReleaseForm :referenceId="reference.id" />
                  </v-card-text>
                </v-card>
              </v-window-item>
              <v-window-item value="option-4">
                <v-card v-if="tab === 'option-4'" flat>
                  <v-card-text>
                    <div v-if="!hasSentRevalidation">
                      <SeaImportValidateElectronicRev :referenceId="reference.id" @update-reference="refresh" />
                    </div>
                    <div v-if="hasSentRevalidation">
                      <div class="flex flex-col">
                        <div class="font-bold">Electronic revalidation</div>
                        <div class="mb-2">The electronic revalidation has been sent to the consignee.</div>
                        <div class="flex justify-start">
                          <v-btn size="small" color="red-darken-4" @click="onClickRedoRevalidation"
                            >Redo revalidation</v-btn
                          >
                        </div>
                        <div class="pt-4">
                          <SeaImportRevalidationDetails :reference="reference" />
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-window-item>
            </v-window>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { LIVERPOOL_MBL_CONSIGNEE_IDS } from '~/utils/data/systemData'
import { authorizeResources } from '~/utils/data/system'

const { $api, $notifications } = useNuxtApp()
const loadingStore = useLoadingStore()
const router = useRouter()
const snackbar = useSnackbar()
const { user } = useCheckUser()

const props = defineProps({
  reference: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['updateReference'])

const tab = ref('option-0')

const customAgents = ref<any[]>([])
const previousAgent = ref<string | null>(null)
const currentReleaseAgentId = ref<number | null>(null)

const currentAgentShortName = computed(() => {
  if (!currentReleaseAgentId.value) return null
  const agent = customAgents.value.find((a: any) => a.id === currentReleaseAgentId.value)
  return agent?.short_name ?? null
})

const agentChanged = computed(() => {
  return !!(previousAgent.value && currentAgentShortName.value && previousAgent.value !== currentAgentShortName.value)
})

const hasArrivalNotification = computed(() => {
  if (!props.reference.arrival_notys) return false
  return props.reference.arrival_notys.length > 0
})

const hasSentRevalidation = computed(() => {
  return props.reference.revalidation?.sent_at != null
})

const isLiverpoolMbl = computed(() => {
  if (!props.reference.master_bls) return false
  return props.reference.master_bls.some((mbl: any) =>
    LIVERPOOL_MBL_CONSIGNEE_IDS.includes(Number(mbl.consignee_mbl_id))
  )
})

const showAgentChangeDialog = ref(false)
const skipAgentChangeCharge = ref(false)
const refreshAuthReqs = ref(false)

const canSkipAgentChangeCharge = computed(() => {
  // Check if user has the specific permission (directly or via role)
  const permissionName = 'revalidation-skip-agent-change-charge'
  const hasDirectPermission = user.value?.permissions?.some((p: any) => p.name === permissionName) ?? false
  const hasRolePermission = user.value?.roles?.some((role: any) =>
    role.permissions?.some((p: any) => p.name === permissionName)
  ) ?? false
  return hasDirectPermission || hasRolePermission
})

const refresh = () => {
  emits('updateReference')
}

const onClickRedoRevalidation = async () => {
  await loadAgentContext()
  showAgentChangeDialog.value = true
  skipAgentChangeCharge.value = false
}

const cancelRedoRevalidation = () => {
  showAgentChangeDialog.value = false
  skipAgentChangeCharge.value = false
}

const executeRedoRevalidation = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.referencias.redoRevalidation(props.reference.id, {
      skip_agent_change_charge: skipAgentChangeCharge.value,
    })
    showAgentChangeDialog.value = false

    const { agent_changed, agent_change_charge_created, agent_change_charge_skipped } = response as any

    if (agent_changed) {
      if (agent_change_charge_created) {
        snackbar.add({
          type: 'warning',
          text: 'The customs agent change has been registered. The corresponding charge will be generated.',
        })
      } else if (agent_change_charge_skipped) {
        snackbar.add({
          type: 'info',
          text: 'The customs agent change has been registered without generating the additional charge (supervisor override).',
        })
      }
    }

    emits('updateReference')
  } catch (e) {
    console.error(e)
    const { isValidationError, bag } = useApiError(e as any)
    if (isValidationError && bag.authorization && bag.authorization.length > 0) {
      snackbar.add({
        type: 'error',
        text: String(
          bag.authorization[0] ?? 'Authorization is required to skip the customs agent change charge.',
        ),
      })
    } else {
      snackbar.add({ type: 'error', text: 'Error while redoing revalidation.' })
    }
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const loadAgentContext = async () => {
  try {
    loadingStore.loading = true
    const [checklist, release, agents] = await Promise.all([
      $api.referencias.getChecklistRevalidation(props.reference.id),
      $api.referencias.getSeaImportReleaseInfo(props.reference.id),
      $api.customAgents.getAll(),
    ])
    previousAgent.value = (checklist as any)?.agente_aduanal ?? null
    currentReleaseAgentId.value = (release as any)?.release_agent_id ?? null
    customAgents.value = agents as any[]

    // Debug logs
    console.log('🔍 Agent Context Loaded:', {
      referenceId: props.reference.id,
      previousAgent: previousAgent.value,
      currentReleaseAgentId: currentReleaseAgentId.value,
      currentAgentShortName: currentAgentShortName.value,
      agentChanged: agentChanged.value,
      canSkipAgentChangeCharge: canSkipAgentChangeCharge.value,
      customAgentsCount: customAgents.value.length,
    })
  } catch (e) {
    console.error('❌ Error loading agent context:', e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await loadAgentContext()
})
</script>
