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
            <p class="text-base">Will the customs agent change in this new revalidation?</p>
          </div>
          <v-alert v-if="showAgentChangeWarning" type="warning" variant="tonal" class="mb-4" border="start" prominent>
            <div class="font-bold mb-2">Important notice</div>
            <p>
              Changing the customs agent will generate an additional charge of <strong>$150 USD</strong> (depending on the
              shipping line for the service).
            </p>
            <p class="mt-2">
              The concept "Customs Agent Change" will be automatically added to Local Charges and an invoice/proforma
              will be generated for the customer.
            </p>
          </v-alert>
          <div v-if="showAgentChangeWarning && canSkipAgentChangeCharge" class="mt-2">
            <v-checkbox
              v-model="skipAgentChangeCharge"
              density="compact"
              color="primary"
              hide-details
              label="This is a data entry correction. Do not generate the customs agent change charge (supervisor only)."
            />
          </div>
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn variant="outlined" @click="cancelRedoRevalidation">Cancel</v-btn>
          <v-btn v-if="!showAgentChangeWarning" color="grey" variant="flat" @click="confirmNoAgentChange">
            No, same agent
          </v-btn>
          <v-btn v-if="!showAgentChangeWarning" color="orange-darken-2" variant="flat" @click="confirmAgentChange">
            Yes, the agent will change
          </v-btn>
          <v-btn v-if="showAgentChangeWarning" color="red-darken-2" variant="flat" @click="executeRedoRevalidation">
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
const showAgentChangeWarning = ref(false)
const willChangeAgent = ref(false)
const skipAgentChangeCharge = ref(false)

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

const onClickRedoRevalidation = () => {
  showAgentChangeDialog.value = true
  showAgentChangeWarning.value = false
  willChangeAgent.value = false
  skipAgentChangeCharge.value = false
}

const cancelRedoRevalidation = () => {
  showAgentChangeDialog.value = false
  showAgentChangeWarning.value = false
  willChangeAgent.value = false
  skipAgentChangeCharge.value = false
}

const confirmNoAgentChange = () => {
  willChangeAgent.value = false
  executeRedoRevalidation()
}

const confirmAgentChange = () => {
  willChangeAgent.value = true
  showAgentChangeWarning.value = true
}

const executeRedoRevalidation = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.referencias.redoRevalidation(props.reference.id, {
      will_change_agent: willChangeAgent.value,
      skip_agent_change_charge: skipAgentChangeCharge.value,
    })
    showAgentChangeDialog.value = false
    showAgentChangeWarning.value = false

    if (willChangeAgent.value) {
      if (response?.agent_change_charge_created) {
        snackbar.add({
          type: 'warning',
          text: 'The customs agent change has been registered. The corresponding charge will be generated.',
        })
      } else if (response?.agent_change_charge_skipped) {
        snackbar.add({
          type: 'info',
          text: 'The customs agent change has been registered without generating the additional charge (supervisor override).',
        })
      }
    }

    emits('updateReference')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
