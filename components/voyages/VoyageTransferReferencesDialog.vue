<template>
  <div>
    <v-tooltip :text="btnTooltip" location="top">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          size="small"
          variant="tonal"
          :color="btnColor"
          :icon="btnIcon"
          @click="showDialog"
        />
      </template>
    </v-tooltip>

    <v-dialog v-model="dialog" max-width="750px">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <div class="flex items-center gap-2">
            <v-icon>mdi-swap-horizontal</v-icon>
            <span>{{ dialogTitle }}</span>
          </div>
        </v-card-title>
        <v-card-text class="pt-4">

          <!-- Loading auth status -->
          <div v-if="loadingAuthStatus" class="flex justify-center py-6">
            <v-progress-circular indeterminate />
          </div>

          <template v-else>
            <!-- Pending request banner -->
            <v-alert v-if="pendingAuthRequest" type="warning" variant="tonal" class="mb-4">
              You already have a pending authorization request (#{{ pendingAuthRequest.id }}) awaiting approval.
            </v-alert>

            <!-- Approved auth banner -->
            <v-alert v-else-if="approvedAuthRequest && !hasDirectPermission" type="success" variant="tonal" class="mb-4">
              Authorization #{{ approvedAuthRequest.id }} has been approved. Select the references and target voyage, then execute the transfer.
            </v-alert>

            <!-- No permission, no auth -->
            <template v-else-if="!hasDirectPermission">
              <v-alert type="info" variant="tonal" class="mb-4">
                {{ tpl.subtitle || 'You need authorization to transfer BLs between voyages. Select the references and target voyage, then provide a reason.' }}
              </v-alert>

              <!-- Template elements -->
              <template v-for="el in tpl.elements" :key="el.id">
                <v-alert
                  v-if="el.type === 'alert_block'"
                  :type="(el as any).alert_type"
                  variant="tonal"
                  density="compact"
                  class="mb-3"
                >
                  {{ (el as any).alert_text }}
                </v-alert>
                <p v-else-if="el.type === 'text_block'" class="text-sm text-medium-emphasis mb-3">
                  {{ (el as any).text }}
                </p>
                <div v-else-if="el.type === 'section'" class="text-caption text-uppercase font-weight-bold text-disabled mb-1 mt-2">
                  {{ (el as any).title }}
                </div>
              </template>
            </template>

            <!-- Source voyage info -->
            <div class="mb-4 p-3 bg-grey-lighten-4 rounded">
              <div class="text-caption text-grey-darken-1 mb-1">Source Voyage</div>
              <div class="font-weight-medium text-body-1">
                {{ props.voyageDest.voyage?.vessel?.name }}
                <span v-if="props.voyageDest.voyage?.vessel?.line?.commercial_name" class="text-grey-darken-1">
                  ({{ props.voyageDest.voyage.vessel.line.commercial_name }})
                </span>
                — {{ props.voyageDest.voyage?.name }}
              </div>
              <div class="text-caption text-grey-darken-1 mt-1 flex gap-3">
                <span v-if="props.voyageDest.pod?.name">
                  <v-icon size="x-small">mdi-map-marker</v-icon>
                  {{ props.voyageDest.pod.name }}
                  <span v-if="props.voyageDest.pod.country?.name">({{ props.voyageDest.pod.country.name }})</span>
                </span>
                <span v-if="props.voyageDest.eta_date">
                  <v-icon size="x-small">mdi-calendar-arrow-right</v-icon>
                  ETA: {{ props.voyageDest.eta_date }}
                </span>
                <span v-if="props.voyageDest.arrival_date">
                  <v-icon size="x-small">mdi-calendar-check</v-icon>
                  ATA: {{ props.voyageDest.arrival_date }}
                </span>
              </div>
            </div>

            <!-- Hide form if pending -->
            <template v-if="!pendingAuthRequest">
              <!-- References selection -->
              <div class="mb-4">
                <div class="text-subtitle-2 mb-2">
                  References to transfer
                  <v-chip size="x-small" class="ml-1">{{ selectedReferenceIds.length }} / {{ referencias.length }} selected</v-chip>
                </div>

                <div v-if="loadingReferencias" class="flex justify-center py-4">
                  <v-progress-circular indeterminate size="24" />
                </div>

                <div v-else-if="referencias.length === 0" class="text-caption text-grey py-2">
                  No references found for this voyage destination.
                </div>

                <div v-else>
                  <div class="flex gap-2 mb-2">
                    <v-btn size="x-small" variant="tonal" @click="selectAll">Select all</v-btn>
                    <v-btn size="x-small" variant="tonal" @click="deselectAll">Deselect all</v-btn>
                  </div>
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th width="40"></th>
                        <th>Reference</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="ref in referencias" :key="ref.id">
                        <td>
                          <v-checkbox
                            v-model="selectedReferenceIds"
                            :value="ref.id"
                            density="compact"
                            hide-details
                          />
                        </td>
                        <td>{{ ref.reference_number || ref.name || `#${ref.id}` }}</td>
                        <td>
                          <v-chip size="x-small">{{ ref.impoExpo === 'I' ? 'Import' : 'Export' }}</v-chip>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>
              </div>

              <!-- Target voyage -->
              <div class="mb-4">
                <div class="text-subtitle-2 mb-2">Target Voyage Destination</div>
                <!-- Locked to the voyage from the approved auth request -->
                <div v-if="approvedAuthRequest && !hasDirectPermission" class="p-3 bg-grey-lighten-4 rounded flex items-center gap-2">
                  <v-icon color="green" size="small">mdi-lock-check</v-icon>
                  <div>
                    <div class="font-weight-medium text-body-2">{{ approvedAuthRequest.resource_data?.target_voyage_name }}</div>
                    <div class="text-caption text-grey-darken-1">Fixed by authorization #{{ approvedAuthRequest.id }}</div>
                  </div>
                </div>
                <!-- Free search (only when no approved auth, filtered to unlocked) -->
                <AGlobalSearch
                  v-else
                  v-model="targetVoyage"
                  :onSearch="searchVoyages"
                  validate-key="target_voyage_destination_id"
                  label="Target voyage"
                  prepend-inner-icon="mdi-ray-end-arrow"
                  :return-object="true"
                  :show-locked-indicator="true"
                />
              </div>

              <!-- Reason (only when requesting auth) -->
              <div v-if="!hasDirectPermission && !approvedAuthRequest && tpl.reason.show" class="mb-4">
                <v-textarea
                  v-model="reason"
                  :label="tpl.reason.label"
                  placeholder="Explain why this BL transfer is needed..."
                  :rows="tpl.reason.rows ?? 3"
                  variant="outlined"
                  density="compact"
                />
              </div>
            </template>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>

          <!-- Has direct permission → execute directly -->
          <v-btn
            v-if="hasDirectPermission"
            color="blue"
            variant="flat"
            :disabled="selectedReferenceIds.length === 0 || !targetVoyage"
            @click="saveChanges(null)"
          >
            Transfer BLs ({{ selectedReferenceIds.length }})
          </v-btn>

          <!-- Has approved auth (no direct permission) → execute with auth -->
          <v-btn
            v-else-if="approvedAuthRequest && !pendingAuthRequest"
            color="green"
            variant="flat"
            :disabled="selectedReferenceIds.length === 0"
            @click="saveChanges(approvedAuthRequest.id)"
          >
            Transfer BLs with Authorization ({{ selectedReferenceIds.length }})
          </v-btn>

          <!-- Pending request → nothing to do -->
          <v-btn
            v-else-if="pendingAuthRequest"
            color="grey"
            variant="flat"
            disabled
          >
            Awaiting Approval
          </v-btn>

          <!-- No auth at all → request -->
          <v-btn
            v-else
            color="orange"
            variant="flat"
            :disabled="selectedReferenceIds.length === 0 || !targetVoyage"
            @click="requestAuthorization"
          >
            {{ tpl.buttons.submit }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { hasPermission } = useCheckUser()
const { getTemplate, loadCatalog } = useRequestTypeCatalog()

const tpl = computed(() => getTemplate('voyage-transfer-references'))

const props = defineProps({
  voyageDest: {
    type: Object as () => any,
    required: true,
  },
  hasApprovedAuth: {
    type: Boolean,
    default: false,
  },
  hasPendingAuth: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['refresh'])

const dialog = ref(false)
const targetVoyage = ref<any>(null)
const reason = ref('')
const referencias = ref<any[]>([])
const selectedReferenceIds = ref<number[]>([])
const loadingReferencias = ref(false)
const loadingAuthStatus = ref(false)
const pendingAuthRequest = ref<any>(null)
const approvedAuthRequest = ref<any>(null)

const hasDirectPermission = computed(() => hasPermission('voyage-transfer-references'))

const btnColor = computed(() => {
  if (hasDirectPermission.value) return 'blue'
  if (props.hasApprovedAuth) return 'green'
  if (props.hasPendingAuth) return 'warning'
  return 'orange'
})

const btnIcon = computed(() => {
  if (props.hasApprovedAuth) return 'mdi-swap-horizontal-bold'
  if (props.hasPendingAuth) return 'mdi-clock-outline'
  return 'mdi-swap-horizontal'
})

const btnTooltip = computed(() => {
  if (hasDirectPermission.value) return 'Transfer BLs'
  if (props.hasApprovedAuth) return 'Transfer BLs — Authorization approved'
  if (props.hasPendingAuth) return 'Transfer BLs — Pending authorization'
  return 'Transfer BLs — Request authorization'
})

const dialogTitle = computed(() => {
  if (hasDirectPermission.value) return 'Transfer BLs to another voyage'
  if (approvedAuthRequest.value) return 'Execute Approved BL Transfer'
  if (pendingAuthRequest.value) return 'BL Transfer — Pending Approval'
  return 'Request BL Transfer Authorization'
})

const selectAll = () => {
  selectedReferenceIds.value = referencias.value.map((r) => r.id)
}

const deselectAll = () => {
  selectedReferenceIds.value = []
}

const loadAuthStatus = async () => {
  if (hasDirectPermission.value) return
  loadingAuthStatus.value = true
  try {
    const requests = (await $api.authRequests.getRequestsByResource({
      resource: 'voyage-transfer-references',
      resource_id: props.voyageDest.id,
    })) as any[]

    console.log('[VoyageTransfer] auth requests:', JSON.stringify(requests))

    pendingAuthRequest.value = requests.find((r: any) => r.is_authorized == null && !r.deleted_at) ?? null
    approvedAuthRequest.value = requests.find((r: any) => r.is_authorized == 1 && !r.used_at && !r.expired && !r.deleted_at) ?? null

    console.log('[VoyageTransfer] pending:', pendingAuthRequest.value?.id, 'approved:', approvedAuthRequest.value?.id)
  } catch (e) {
    console.error('[VoyageTransfer] error loading auth status:', e)
  } finally {
    loadingAuthStatus.value = false
  }
}

const loadReferencias = async () => {
  loadingReferencias.value = true
  try {
    const response = await $api.voyages.getDestiantionReferenciasById(String(props.voyageDest.id))
    referencias.value = (response as any)?.referencias ?? (response as any) ?? []
    selectAll()
  } catch (e) {
    snackbar.add({ type: 'error', text: 'Error loading references.' })
  } finally {
    loadingReferencias.value = false
  }
}

const showDialog = async () => {
  loadCatalog(true)
  dialog.value = true
  targetVoyage.value = null
  reason.value = ''
  referencias.value = []
  selectedReferenceIds.value = []
  pendingAuthRequest.value = null
  approvedAuthRequest.value = null
  await Promise.all([loadAuthStatus(), loadReferencias()])
}

const searchVoyages = async (search: any) => {
  try {
    const isImport = props.voyageDest.voyage?.impoExpo === 'I'
    const response = (isImport
      ? await $api.voyages.searchImportVoyages({ query: search })
      : await $api.voyages.searchExportVoyages({ query: search })) as any[]
    // exclude deleted destinations (locked ones still appear but are disabled via showLockedIndicator)
    return response.filter((d: any) => !d.deleted_at)
  } catch (error) {
    snackbar.add({ type: 'error', text: 'Error fetching voyages' })
  }
}

const saveChanges = async (authRequestId: number | null) => {
  if (selectedReferenceIds.value.length === 0) {
    snackbar.add({ type: 'warning', text: 'Please select at least one reference.' })
    return
  }

  // When using an approved auth, the target is fixed from resource_data
  const targetId = authRequestId && approvedAuthRequest.value
    ? approvedAuthRequest.value.resource_data?.target_voyage_destination_id
    : (typeof targetVoyage.value === 'object' ? targetVoyage.value?.id : targetVoyage.value)

  if (!targetId) {
    snackbar.add({ type: 'warning', text: 'Please select a target voyage.' })
    return
  }

  try {
    loadingStore.start()
    await $api.voyages.transferReferences(props.voyageDest.id, {
      target_voyage_destination_id: targetId,
      reference_ids: selectedReferenceIds.value,
      ...(authRequestId ? { auth_request_id: authRequestId } : {}),
    })
    snackbar.add({ type: 'success', text: 'BLs transferred successfully.' })
    dialog.value = false
    emits('refresh')
  } catch (error) {
    snackbar.add({ type: 'error', text: 'Error transferring BLs. Please try again.' })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const requestAuthorization = async () => {
  if (selectedReferenceIds.value.length === 0) {
    snackbar.add({ type: 'warning', text: 'Please select at least one reference.' })
    return
  }
  if (!targetVoyage.value) {
    snackbar.add({ type: 'warning', text: 'Please select a target voyage.' })
    return
  }
  if (tpl.value.reason.show && tpl.value.reason.required && (!reason.value || reason.value.trim() === '')) {
    snackbar.add({ type: 'warning', text: 'Please provide a reason for the transfer.' })
    return
  }

  const targetId = typeof targetVoyage.value === 'object' ? targetVoyage.value.id : targetVoyage.value
  const targetData = typeof targetVoyage.value === 'object' ? targetVoyage.value : await $api.voyages.getById(targetVoyage.value)

  const authRequest = {
    resource: 'voyage-transfer-references',
    resource_id: props.voyageDest.id,
    resource_data: {
      source_voyage_name: props.voyageDest.voyage?.name,
      source_voyage_destination_id: props.voyageDest.id,
      reference_ids: selectedReferenceIds.value,
      total_selected: selectedReferenceIds.value.length,
      target_voyage_destination_id: targetId,
      target_voyage_name: targetData.name,
    },
    request_reason: reason.value,
    priority: 'medium',
  }

  try {
    loadingStore.start()
    await $api.authRequests.requestAuthorization(authRequest)
    snackbar.add({ type: 'success', text: 'Authorization request submitted. You will be notified when reviewed.' })
    dialog.value = false
    emits('refresh')
  } catch (error: any) {
    snackbar.add({ type: 'error', text: error?.data?.message || 'Error submitting authorization request.' })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}
</script>
