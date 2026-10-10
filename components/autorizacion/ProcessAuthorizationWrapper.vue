<template>
  <div class="paw-root" :class="{ 'paw-root--block': block }">
    <!-- The approval policy says this user can act without a request -->
    <div v-if="canActDirectly" class="paw-direct">
      <slot name="auth"></slot>
    </div>

    <!-- No request yet -->
    <v-btn
      v-else-if="!hasPendingRequest && !hasGrantedRequest"
      variant="tonal"
      color="amber-darken-2"
      size="small"
      class="paw-btn"
      @click="confirmRequestAuthorization"
    >
      <v-icon start size="16">mdi-shield-lock-outline</v-icon>
      {{ label }}
    </v-btn>

    <!-- Pending -->
    <div v-else-if="hasPendingRequest && !hasGrantedRequest" class="paw-pending">
      <v-tooltip :text="`No changes have been made yet — '${label}' will run once this request is approved.`" location="top">
        <template #activator="{ props: tooltipProps }">
          <v-chip
            v-bind="tooltipProps"
            color="amber-darken-2"
            variant="tonal"
            size="small"
            class="paw-chip-pending"
          >
            <v-icon start size="14">mdi-clock-outline</v-icon>
            {{ label }} — pending approval
            <v-progress-circular v-if="isPolling" indeterminate size="10" width="1" class="ml-1" />
          </v-chip>
        </template>
      </v-tooltip>
      <span v-if="pendingRequest" class="paw-requester text-caption text-medium-emphasis ml-2">
        Requested by <strong>{{ requesterName }}</strong> · {{ formatDateString(pendingRequest.created_at) }}
        <template v-if="assignmentSummary"> · also for: {{ assignmentSummary }}</template>
      </span>
      <v-btn
        v-if="canWithdraw"
        variant="text"
        color="error"
        size="x-small"
        class="ml-1"
        title="Withdraw your approval request (does not change the record itself)"
        @click="confirmDeleteRequestAuthorization"
      >
        <v-icon size="14">mdi-undo-variant</v-icon>
        Withdraw request
      </v-btn>
    </div>

    <!-- Granted -->
    <div v-else-if="hasGrantedRequest" class="paw-granted" :class="{ 'paw-granted--block': block }">
      <slot name="auth"></slot>
      <v-chip color="success" variant="tonal" size="small" class="paw-chip-granted">
        <v-icon start size="14">mdi-shield-check</v-icon>
        Authorized until {{ formatDateString(activeAuthorization?.expires_at) }}
      </v-chip>
      <span v-if="grantedNote" class="text-caption text-medium-emphasis">{{ grantedNote }}</span>
    </div>

    <!-- Request dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6 gap-2 d-flex align-center">
          <v-icon>mdi-shield-lock-outline</v-icon>
          {{ tpl.title || 'Request Authorization' }}
        </v-card-title>
        <v-card-text>
          <p v-if="tpl.subtitle" class="text-sm text-medium-emphasis mb-3">{{ tpl.subtitle }}</p>
          <p v-else class="text-sm mb-2">{{ friendlyDisplayName }}</p>

          <!-- Template elements in order -->
          <template v-for="el in tpl.elements" :key="el.id">
            <!-- alert_block -->
            <v-alert
              v-if="el.type === 'alert_block'"
              :type="(el as any).alert_type"
              variant="tonal"
              density="compact"
              class="mb-3"
            >
              {{ (el as any).alert_text }}
            </v-alert>

            <!-- text_block -->
            <p v-else-if="el.type === 'text_block'" class="text-sm text-medium-emphasis mb-3">
              {{ (el as any).text }}
            </p>

            <!-- section header -->
            <div v-else-if="el.type === 'section'" class="text-caption text-uppercase font-weight-bold text-disabled mb-1 mt-2">
              {{ (el as any).title }}
            </div>

            <!-- form_field from template elements -->
            <DynamicRequestFormFields
              v-else-if="el.type === 'form_field'"
              :fields="[(el as any).field]"
              :field-catalogs="fieldCatalogs"
              :model-value="formData"
              @update:model-value="formData = $event"
            />

            <!-- charge_builder: code-driven multi-charge widget (static catalog) -->
            <ChargeBuilderField
              v-else-if="el.type === 'charge_builder'"
              :model-value="chargesData[el.id] ?? []"
              :charges-catalog="fieldCatalogs[(el as any).charges_catalog_key] ?? []"
              @update:model-value="chargesData[el.id] = $event"
            />

            <!-- charge_builder_combined: multi-charge widget for buy+sell-combined-row models (Sea Export / Air) -->
            <ChargeBuilderFieldCombined
              v-else-if="el.type === 'charge_builder_combined'"
              :model-value="chargesData[el.id] ?? []"
              :charges-catalog="fieldCatalogs[(el as any).charges_catalog_key] ?? []"
              :variant="(el as any).variant"
              @update:model-value="chargesData[el.id] = $event"
            />

            <!-- charge_builder_buyrate: multi-charge widget for Sea Import buy-rate charges (no buy/sell split) -->
            <ChargeBuilderFieldBuyRate
              v-else-if="el.type === 'charge_builder_buyrate'"
              :model-value="chargesData[el.id] ?? []"
              :charges-catalog="fieldCatalogs[(el as any).charges_catalog_key] ?? []"
              :currency-options="fieldCatalogs[(el as any).currencies_catalog_key ?? 'currencies'] ?? []"
              :master-bl-options="fieldCatalogs[(el as any).master_bls_catalog_key ?? 'master_bls'] ?? []"
              @update:model-value="chargesData[el.id] = $event"
            />

            <!-- invoice_charge_builder: invoice search + charge picker for credit notes -->
            <InvoiceChargeBuilderField
              v-else-if="el.type === 'invoice_charge_builder'"
              :model-value="chargesData[el.id] ?? []"
              :credit-note-id="props.processData?.[(el as any).credit_note_id_key]"
              @update:model-value="chargesData[el.id] = $event"
            />

            <!-- file_upload: drag & drop supporting documents -->
            <FileDropZone
              v-else-if="el.type === 'file_upload'"
              :model-value="filesData"
              :label="(el as any).label"
              @update:model-value="filesData = $event"
            />
          </template>

          <!-- Dynamic form fields from prop (legacy / extra fields) -->
          <DynamicRequestFormFields
            v-if="formFields && formFields.length > 0"
            :fields="formFields"
            :field-catalogs="fieldCatalogs"
            :model-value="formData"
            @update:model-value="formData = $event"
          />

          <!-- Reason field -->
          <v-textarea
            v-if="tpl.reason.show"
            v-model="form.reason"
            :label="tpl.reason.label"
            :rows="tpl.reason.rows ?? 3"
            counter
            clearable
            class="mt-2"
          />

          <!-- Who will carry the action out once it is approved (only when a person does it) -->
          <template v-if="showAssignment">
            <v-divider class="my-3" />
            <div class="text-caption text-uppercase font-weight-bold text-disabled mb-1">Who will carry it out once approved?</div>
            <div class="text-caption text-medium-emphasis mb-3">
              You can always do it yourself. Add a department (any of its members can do it) and/or specific people.
            </div>
            <v-autocomplete
              v-model="assignment.departmentId"
              :items="departmentOptions"
              item-title="name"
              item-value="id"
              label="Department (optional)"
              :loading="loadingAssignment"
              prepend-inner-icon="mdi-domain"
              density="compact"
              clearable
              hide-details
              class="mb-3"
            />
            <v-autocomplete
              v-model="assignment.userIds"
              :items="userOptions"
              item-title="name"
              item-value="id"
              label="People (optional)"
              :loading="loadingAssignment"
              prepend-inner-icon="mdi-account-multiple-plus-outline"
              density="compact"
              multiple
              chips
              closable-chips
              clearable
              hide-details
            />
          </template>
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn color="error" @click="showConfirmDialog = false">{{ tpl.buttons.cancel }}</v-btn>
            <v-btn color="success" @click="onRequestAuthorizationClick">{{ tpl.buttons.submit }}</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Withdraw dialog -->
    <v-dialog v-model="showConfirmDelReqDialog" max-width="440">
      <v-card class="chip-velvet">
        <v-card-title class="text-h6">
          <v-icon>mdi-undo-variant</v-icon> Withdraw approval request
        </v-card-title>
        <v-card-text class="bg-surface-light pt-2">
          <v-alert type="info" variant="tonal" density="compact" class="mb-3">
            This only withdraws <strong>your request for approval</strong>. It does not cancel, delete or change
            "{{ props.displayName || props.label }}".
          </v-alert>
          <v-textarea label="Why are you withdrawing it?" v-model="form.reason_deleted" counter rows="3" clearable />
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn variant="text" @click="showConfirmDelReqDialog = false">Keep request</v-btn>
            <v-btn color="warning" variant="flat" @click="onRequestCancelAuthorizationClick">Withdraw request</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { getProcessDisplayName } from '~/utils/data/system'
import type { IFormField } from '~/repository/modules/catalogs/authRequestTypes'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { getTemplate, getType, loadCatalog } = useRequestTypeCatalog()

const props = defineProps({
  processName: { type: String, required: true },
  requestKey: { type: String, required: true },
  label: { type: String, required: true },
  displayName: { type: String, default: '' },
  refresh: { type: Boolean, default: false },
  processData: { type: Object, default: null },
  // Current values of the record being edited (e.g. an existing charge), used
  // to pre-fill the form_field elements when action === 'edit' — otherwise the
  // dialog always opens empty, even though the user is editing something real.
  initialFormData: { type: Object, default: null },
  formFields: { type: Array as PropType<IFormField[]>, default: () => [] },
  fieldCatalogs: { type: Object as PropType<Record<string, { label: string; value: any }[]>>, default: () => ({}) },
  // The default layout is inline-flex, sized for a small button/chip in the
  // #auth slot. Set this when the slot renders large block content (forms,
  // cards) so it isn't squeezed to fit an inline-flex row.
  block: { type: Boolean, default: false },
})

const emit = defineEmits<{ refresh: [] }>()

const tpl = computed(() => getTemplate(props.processName))

const friendlyDisplayName = computed(() => {
  if (props.displayName) return `${props.label} — ${props.displayName}`
  return getProcessDisplayName(props.processName, props.requestKey, null)
})

const showConfirmDialog = ref(false)
const showConfirmDelReqDialog = ref(false)
const userRequests = ref<any[]>([])
const requestForProcess = ref<any[]>([])
const form = ref({ reason: '', reason_deleted: '' })
const formData = ref<Record<string, any>>({})
// Accumulated charges from charge_builder elements (keyed by element id)
const chargesData = ref<Record<string, any[]>>({})
// Supporting documents from file_upload elements
const filesData = ref<File[]>([])

const processNameKey = computed(() =>
  props.requestKey == null ? props.processName : `${props.processName}:${props.requestKey}`
)
const hasPendingRequest = computed(() =>
  requestForProcess.value.some((r: any) => r.status === 'pending')
)
const { user: currentUser, isAdminRole, hasPermission } = useCheckUser()

// ── Approval policy (auth_request_types.approval_mode) ─────────────────────────
// permission: holders of the permission act directly (known client-side).
// state: the server decides from the record's state (eligibility endpoint).
// always / no policy: always the request flow, as before.
const policy = computed(() => getType(props.processName))
const eligibility = ref<{ can_act_directly: boolean } | null>(null)
const canActDirectly = computed(() => {
  const mode = policy.value?.approval_mode
  if (mode === 'permission') return !!policy.value?.approval_permission && hasPermission(policy.value.approval_permission)
  if (mode === 'state') return eligibility.value?.can_act_directly === true
  return false
})
async function loadEligibility() {
  await loadCatalog()
  if (policy.value?.approval_mode !== 'state') return
  try {
    eligibility.value = (await ($api as any).authProcessRequests.getEligibility({
      process_name: props.processName,
      request_key: String(props.requestKey ?? ''),
    })) as any
  } catch {
    eligibility.value = null // on doubt, keep the request flow
  }
}
// ── Assignment (departments / people who can carry the action out) ───────────────
// Auto-executed types are carried out by the approver, so there is nobody to assign.
const showAssignment = computed(() => policy.value?.kind === 'process' && policy.value?.automatable !== true)
const assignment = ref<{ departmentId: number | null; userIds: number[] }>({ departmentId: null, userIds: [] })
const departmentOptions = ref<any[]>([])
const userOptions = ref<any[]>([])
const loadingAssignment = ref(false)
async function loadAssignmentOptions() {
  if (!showAssignment.value || (departmentOptions.value.length && userOptions.value.length)) return
  loadingAssignment.value = true
  try {
    const [departments, users] = await Promise.all([
      ($api as any).departments.getAllDepartments(),
      ($api as any).users.getAllUsers(),
    ])
    departmentOptions.value = (departments as any[]) ?? []
    userOptions.value = ((users as any[]) ?? []).filter((u: any) => u.id !== currentUser.value?.id)
  } catch (e) {
    console.error(e)
  } finally {
    loadingAssignment.value = false
  }
}
const assignmentSummary = computed(() => {
  const req = pendingRequest.value ?? activeAuthorization.value
  if (!req) return ''
  const parts: string[] = []
  if (req.department?.name) parts.push(req.department.name)
  for (const e of req.executors ?? []) parts.push(e.name)
  return parts.join(', ')
})

// Who asked for it / who else can carry it out, shown next to an approved request
const grantedNote = computed(() => {
  const req = activeAuthorization.value
  if (!req) return ''
  const parts: string[] = []
  if (req.user_id !== currentUser.value?.id && req.user?.name) parts.push(`Requested by ${req.user.name}`)
  const others: string[] = []
  if (req.department?.name) others.push(req.department.name)
  for (const e of req.executors ?? []) others.push(e.name)
  if (others.length) parts.push(`for ${others.join(', ')}`)
  return parts.join(' · ')
})

const pendingRequest = computed(() => requestForProcess.value.find((r: any) => r.status === 'pending') ?? null)
const requesterName = computed(() => pendingRequest.value?.user?.name ?? pendingRequest.value?.requested?.name ?? 'someone')
// Only whoever asked (or an administrator) can withdraw a request
const canWithdraw = computed(() => {
  if (!pendingRequest.value) return false
  return pendingRequest.value.user_id === currentUser.value?.id || !!isAdminRole()
})
const hasGrantedRequest = computed(() =>
  userRequests.value.some(
    (req: any) =>
      req.process_name_key === processNameKey.value &&
      req.status === 'granted' &&
      req.is_granted &&
      !req.used_at
  )
)
const activeAuthorization = computed(() =>
  userRequests.value.find(
    (req: any) => req.process_name_key === processNameKey.value && req.status === 'granted' && req.is_granted
  )
)

// ── Polling ──────────────────────────────────────────────────────────────────

const { hasPending, isPolling, fetchOnce, startPolling, stopPolling } = useRequestPolling({
  processName: props.processName,
  requestKey: props.requestKey,
  onStatusChange: async (fresh, prev) => {
    const prevPending = prev.some((r: any) => r.status === 'pending')
    const freshHasGranted = fresh.some((r: any) => r.status === 'granted')

    if (prevPending && freshHasGranted) {
      snackbar.add({ type: 'success', text: 'Your request was approved. The action has been executed.' })
      emit('refresh')
    }

    await syncUserRequests()
  },
})

async function syncUserRequests() {
  const [allRequests, byResource] = await Promise.all([
    ($api as any).authProcessRequests.getUserRequests(),
    ($api as any).authProcessRequests.getRequestsByResource({
      process_name: props.processName,
      request_key: props.requestKey,
    }),
  ])
  userRequests.value = allRequests
  requestForProcess.value = byResource
}

async function fetchUserRequests() {
  try {
    loadingStore.loading = true
    await syncUserRequests()

    if (hasPendingRequest.value) {
      startPolling()
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingStore.stop()
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────

const confirmRequestAuthorization = () => {
  // Refresh the template catalog so recent template edits are reflected
  loadCatalog(true)
  loadAssignmentOptions()
  formData.value = props.initialFormData ? { ...props.initialFormData } : {}
  showConfirmDialog.value = true
}

const confirmDeleteRequestAuthorization = () => {
  showConfirmDelReqDialog.value = true
}

const onRequestAuthorizationClick = async () => {
  try {
    if (tpl.value.reason.show && tpl.value.reason.required && !form.value.reason.trim()) {
      snackbar.add({ type: 'error', text: 'Please provide a reason for the authorization request' })
      return
    }

    // A charge_builder element means this request is only meaningful once it carries
    // at least one charge — otherwise approval would auto-execute against nothing (see
    // sea-import.add-charge-locked: request #191 shipped with only { referencia_id }).
    const hasChargeBuilder = tpl.value.elements?.some(
      (el: any) =>
        el.type === 'charge_builder' || el.type === 'charge_builder_combined' || el.type === 'charge_builder_buyrate'
    )
    const allCharges = Object.values(chargesData.value).flat()
    if (hasChargeBuilder && allCharges.length === 0) {
      snackbar.add({ type: 'error', text: 'Add at least one charge to the list before submitting' })
      return
    }

    const missingField = tpl.value.elements?.find(
      (el: any) => el.type === 'form_field' && el.field?.required && !formData.value[el.field.name]
    )
    if (missingField) {
      snackbar.add({ type: 'error', text: `Please fill in "${missingField.field.label}" before submitting` })
      return
    }

    loadingStore.loading = true

    const body: Record<string, any> = {
      process_name: props.processName,
      request_key: props.requestKey,
      display_name: friendlyDisplayName.value,
      reason: form.value.reason,
    }

    if (props.processData) {
      body.process_data = props.processData
    }

    if (Object.keys(formData.value).length > 0) {
      body.process_data = { ...(body.process_data ?? {}), form_data: formData.value }
    }

    // Merge all charges from charge_builder elements into process_data.charges
    if (allCharges.length > 0) {
      body.process_data = { ...(body.process_data ?? {}), charges: allCharges }
    }

    // Attach supporting documents from file_upload elements
    if (filesData.value.length > 0) {
      body.files = filesData.value
    }

    // Who else can carry the action out once approved
    if (showAssignment.value) {
      if (assignment.value.departmentId) body.department_id = assignment.value.departmentId
      if (assignment.value.userIds.length > 0) body.executor_user_ids = assignment.value.userIds
    }

    await ($api as any).authProcessRequests.requestAuthorization(body)

    snackbar.add({ type: 'success', text: 'Authorization request sent' })
    showConfirmDialog.value = false
    form.value.reason = ''
    formData.value = {}
    chargesData.value = {}
    filesData.value = []
    assignment.value = { departmentId: null, userIds: [] }

    await fetchUserRequests()
    startPolling()
  } catch (e) {
    console.error(e)
  } finally {
    loadingStore.stop()
  }
}

const onRequestCancelAuthorizationClick = async () => {
  try {
    if (!form.value.reason_deleted.trim()) {
      snackbar.add({ type: 'error', text: 'Please tell us why you are withdrawing the request' })
      return
    }
    loadingStore.loading = true

    const reason_deleted = { reason_deleted: form.value.reason_deleted.trim() }
    // Only the pending requests this user is allowed to withdraw (never someone else's)
    const mine = requestForProcess.value.filter(
      (r: any) => r.status === 'pending' && (r.user_id === currentUser.value?.id || isAdminRole())
    )
    for (const req of mine) {
      await ($api as any).authProcessRequests.cancelAuth(req.id, reason_deleted)
    }

    snackbar.add({ type: 'success', text: 'Your approval request was withdrawn' })
    showConfirmDelReqDialog.value = false
    form.value.reason_deleted = ''
    stopPolling()
    await fetchUserRequests()
  } catch (e) {
    console.error(e)
    loadingStore.stop()
  } finally {
    loadingStore.stop()
  }
}

onMounted(() => {
  loadEligibility() // also loads the catalog
  fetchUserRequests()
})

watch(
  () => props.refresh,
  async (newVal) => {
    if (newVal) await fetchUserRequests()
  },
  { immediate: true }
)
</script>

<style scoped>
.paw-root {
  display: inline-flex;
  align-items: center;
}

.paw-root--block {
  display: block;
}

.paw-btn {
  font-size: 12px;
  letter-spacing: 0.01em;
}

.paw-direct {
  display: inline-flex;
  align-items: center;
}

.paw-pending {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}

.paw-chip-pending {
  font-size: 11px;
}

.paw-granted {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.paw-granted--block {
  display: block;
}

.paw-granted--block .paw-chip-granted {
  display: inline-flex;
  margin-top: 8px;
}

.paw-chip-granted {
  font-size: 11px;
}
</style>
