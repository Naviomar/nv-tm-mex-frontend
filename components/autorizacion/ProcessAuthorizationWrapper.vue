<template>
  <div class="perspective-distant">
    <div class="pt-0 flex flex-col">
      <div class="flex flex-col justify-around gap-2 mb-0">
        <!-- No request yet: show request button -->
        <div
          v-if="!hasPendingRequest && !hasGrantedRequest"
          class="transform-3d relative border-2 border-yellow-500 border-dashed p-1 rounded-lg shadow shadow-yellow-500 hover:animate-dash-moving"
        >
          <div
            class="font-bold text-center text-xs p-1 rounded-lg chip-sand cursor-pointer"
            @click="confirmRequestAuthorization"
          >
            <v-icon>mdi-shield-lock-outline</v-icon>
            <br />
            <span class="italic">{{ label }}</span>
          </div>
        </div>

        <!-- Pending: show cancel + pending indicator -->
        <div
          v-if="hasPendingRequest && !hasGrantedRequest"
          class="cursor-pointer transform-3d relative border-2 border-yellow-500 border-dashed p-1 rounded-lg shadow shadow-yellow-500 hover:animate-dash-moving"
        >
          <div
            class="font-bold text-center text-xs p-1 rounded-lg cursor-pointer bg-red-100 text-red-700"
            @click="confirmDeleteRequestAuthorization"
          >
            <v-icon>mdi-shield-remove-outline</v-icon>
            <br />
            <span class="italic">Cancel Authorization</span>
          </div>
        </div>
        <div
          v-if="hasPendingRequest && !hasGrantedRequest"
          class="transform-3d relative border-2 border-yellow-500 border-dashed p-1 rounded-lg shadow shadow-yellow-500 hover:animate-dash-moving"
        >
          <div class="text-center text-xs leading-none p-1 rounded-lg chip-peach">
            <v-icon>mdi-shield-lock-outline</v-icon>
            <span class="italic">Authorization Pending</span>
            <v-progress-circular v-if="isPolling" indeterminate size="10" width="1" class="ml-1" />
          </div>
        </div>
      </div>

      <!-- Granted -->
      <div
        v-if="hasGrantedRequest"
        class="transform-3d relative border-2 border-yellow-500 border-dashed p-1 rounded-lg shadow shadow-yellow-500 hover:animate-dash-moving"
      >
        <div class="text-center text-xs leading-none">
          <slot name="auth"></slot>
          <div class="italic mt-1">
            <v-icon size="small">mdi-shield-check</v-icon> Authorized until
            {{ formatDateString(activeAuthorization?.expires_at) }}
          </div>
        </div>
      </div>
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

            <!-- invoice_charge_builder: invoice search + charge picker for credit notes -->
            <InvoiceChargeBuilderField
              v-else-if="el.type === 'invoice_charge_builder'"
              :model-value="chargesData[el.id] ?? []"
              :credit-note-id="props.processData?.[(el as any).credit_note_id_key]"
              @update:model-value="chargesData[el.id] = $event"
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
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn color="error" @click="showConfirmDialog = false">{{ tpl.buttons.cancel }}</v-btn>
            <v-btn color="success" @click="onRequestAuthorizationClick">{{ tpl.buttons.submit }}</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cancel dialog -->
    <v-dialog v-model="showConfirmDelReqDialog" max-width="400">
      <v-card class="chip-velvet">
        <v-card-title class="text-h6">
          <v-icon>mdi-shield-lock-outline</v-icon> Cancel Process Auth
        </v-card-title>
        <v-card-text class="bg-surface-light pt-2">
          <div class="leading-none">Are you sure you want to cancel this authorization request?</div>
          <v-textarea label="Reason" v-model="form.reason_deleted" counter rows="3" clearable />
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn color="error" @click="showConfirmDelReqDialog = false">Close</v-btn>
            <v-btn color="success" @click="onRequestCancelAuthorizationClick">Cancel</v-btn>
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
const { getTemplate, loadCatalog } = useRequestTypeCatalog()

const props = defineProps({
  processName: { type: String, required: true },
  requestKey: { type: String, required: true },
  label: { type: String, required: true },
  displayName: { type: String, default: '' },
  refresh: { type: Boolean, default: false },
  processData: { type: Object, default: null },
  formFields: { type: Array as PropType<IFormField[]>, default: () => [] },
  fieldCatalogs: { type: Object as PropType<Record<string, { label: string; value: any }[]>>, default: () => ({}) },
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

const processNameKey = computed(() =>
  props.requestKey == null ? props.processName : `${props.processName}:${props.requestKey}`
)
const hasPendingRequest = computed(() => requestForProcess.value.length > 0)
const hasGrantedRequest = computed(() =>
  userRequests.value.some(
    (req: any) => req.process_name_key === processNameKey.value && req.status === 'granted' && req.is_granted
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
    const allCharges = Object.values(chargesData.value).flat()
    if (allCharges.length > 0) {
      body.process_data = { ...(body.process_data ?? {}), charges: allCharges }
    }

    await ($api as any).authProcessRequests.requestAuthorization(body)

    snackbar.add({ type: 'success', text: 'Authorization request sent' })
    showConfirmDialog.value = false
    form.value.reason = ''
    formData.value = {}
    chargesData.value = {}

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
      snackbar.add({ type: 'error', text: 'Please provide a reason for the cancellation' })
      return
    }
    loadingStore.loading = true

    const reason_deleted = { reason_deleted: form.value.reason_deleted.trim() }
    for (const req of requestForProcess.value) {
      await ($api as any).authProcessRequests.cancelAuth(req.id, reason_deleted)
    }

    snackbar.add({ type: 'success', text: 'Authorization request was canceled' })
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
  loadCatalog()
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
