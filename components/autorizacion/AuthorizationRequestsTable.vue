<template>
  <v-card variant="flat">
    <v-card-text class="px-0">
      <RequestFilterCard @search="onClickFilters" @clear="clearFilters">
        <v-text-field
          v-model="filters.search"
          class="req-filters__wide"
          density="compact"
          label="Search"
          placeholder="Reason, requester, invoice or reference number…"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
        />
        <v-text-field v-model="filters.id" type="number" density="compact" label="Request ID" hide-details />
        <v-text-field v-model="filters.resourceId" density="compact" label="Invoice / reference #" clearable hide-details />
        <v-autocomplete
          v-model="filters.resource"
          :items="resourceTypeItems"
          item-title="description"
          item-value="resource"
          density="compact"
          label="Request type"
          clearable
          hide-details
        />
        <v-autocomplete
          v-model="filters.requestedBy"
          :items="catalogs.users"
          item-title="name"
          item-value="id"
          density="compact"
          label="Requested by"
          clearable
          hide-details
        />
        <v-autocomplete
          density="compact"
          label="Records"
          v-model="filters.deleted_status"
          :items="deletedStatus"
          item-title="name"
          item-value="value"
          hide-details
        />
        <template #quick>
          <v-chip
            v-for="opt in decisionOptions"
            :key="opt.value ?? 'all'"
            size="small"
            :color="opt.color"
            :variant="filters.decision === opt.value ? 'flat' : 'tonal'"
            @click="setDecision(opt.value)"
          >{{ opt.label }}</v-chip>
        </template>
      </RequestFilterCard>

      <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-2">
        <div class="text-caption text-medium-emphasis">
          Showing {{ authRequests.from ?? 0 }}–{{ authRequests.to ?? 0 }} of {{ authRequests.total ?? 0 }} requests
        </div>
        <v-pagination
          v-model="authRequests.current_page"
          :length="authRequests.last_page"
          rounded="circle"
          density="compact"
          :total-visible="7"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </div>

      <v-card variant="flat" border rounded="lg">
      <v-table density="comfortable" class="req-table" fixed-header>
        <colgroup>
          <col style="width: 56px" />
          <col style="width: 130px" />
          <col style="width: 270px" />
          <col style="width: 180px" />
          <col style="width: 300px" />
          <col style="width: 180px" />
          <col style="width: 190px" />
          <col style="width: 130px" />
        </colgroup>
        <thead>
          <tr>
            <th class="text-left">ID</th>
            <th class="text-left">Actions</th>
            <th class="text-left">Request</th>
            <th class="text-left">Requested by</th>
            <th class="text-left">
              <div class="d-flex align-center gap-1">
                Reason
                <v-btn
                  size="x-small"
                  variant="text"
                  :icon="allExpanded ? 'mdi-arrow-collapse-vertical' : 'mdi-arrow-expand-vertical'"
                  :title="allExpanded ? 'Collapse all' : 'Expand all'"
                  @click="toggleAll"
                />
              </div>
            </th>
            <th class="text-left">Attachments</th>
            <th class="text-left">Status</th>
            <th class="text-left">Valid until</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(authRequest, index) in authRequests.data"
            :key="`authRequest-${index}`"
            :class="{
              'dark:hover:bg-gray-700! hover:bg-slate-300!': true,
              'bg-red-100! dark:bg-red-900!': authRequest.deleted_at,
              'bg-green-50! dark:bg-green-950!': !authRequest.deleted_at && isPendingToGrant(authRequest),
            }"
          >
            <td class="text-medium-emphasis">{{ authRequest.id }}</td>
            <td>
              <div class="d-flex gap-1">
                <v-btn icon size="small" variant="text" color="primary" title="Open chat" @click="openChat(authRequest)">
                  <v-badge
                    v-if="authRequest.unread_count"
                    :content="authRequest.unread_count"
                    color="error"
                    overlap
                  >
                    <v-icon>mdi-message-text-outline</v-icon>
                  </v-badge>
                  <v-icon v-else>mdi-message-text-outline</v-icon>
                </v-btn>
                <v-btn
                  v-if="isPendingToGrant(authRequest) && hasPermission('authorization-requests-respond')"
                  icon size="small" variant="text" color="success"
                  title="Approve or deny"
                  @click="showFormGrant(authRequest)"
                >
                  <v-icon>mdi-check-circle-outline</v-icon>
                </v-btn>
                <v-btn
                  v-if="canDelete(authRequest)"
                  icon size="small" variant="text" color="error"
                  title="Cancel request"
                  @click="showFormCancel(authRequest)"
                >
                  <v-icon>mdi-close-circle-outline</v-icon>
                </v-btn>
              </div>
            </td>
            <td>
              <div class="cell-title">{{ getResourceName(authRequest.resource) }}</div>
              <div class="d-flex align-center gap-1">
                <span class="cell-sub">#{{ authRequest.invoice_number || authRequest.resource_id }}</span>
                <v-btn
                  v-if="hasInvoiceCancellationHistory(authRequest)"
                  size="x-small"
                  variant="text"
                  color="info"
                  icon="mdi-file-compare"
                  @click="openHistoryDialog(authRequest)"
                  title="View cancellation history"
                />
              </div>
              <!-- Voyage transfer details -->
              <div v-if="authRequest.resource === 'voyage-transfer-references' && authRequest.resource_data" class="mt-2">
                <div class="flex items-center gap-1 flex-wrap">
                  <v-chip size="x-small" color="red-darken-1" variant="flat">
                    {{ authRequest.resource_data.source_voyage_name || 'Unknown' }}
                  </v-chip>
                  <v-icon size="16" color="grey">mdi-arrow-right</v-icon>
                  <v-chip size="x-small" color="green-darken-1" variant="flat">
                    {{ authRequest.resource_data.target_voyage_name || 'Unknown' }}
                  </v-chip>
                </div>
                <div class="text-xs text-grey-darken-1 mt-1">
                  {{ authRequest.resource_data.total_selected }} reference(s) selected
                </div>
              </div>
              <!-- Voyage change details -->
              <div v-if="authRequest.resource === 'sea-import-update-locked-voyage' && authRequest.resource_data" class="mt-2">
                <div class="flex items-center gap-1 flex-wrap">
                  <v-chip size="x-small" color="red-darken-1" variant="flat">
                    {{ authRequest.resource_data.old_voyage_name || 'Unknown' }}
                    <span v-if="authRequest.resource_data.old_voyage_internal_code" class="ml-1">({{ authRequest.resource_data.old_voyage_internal_code }})</span>
                  </v-chip>
                  <v-icon size="16" color="grey">mdi-arrow-right</v-icon>
                  <v-chip size="x-small" color="green-darken-1" variant="flat">
                    {{ authRequest.resource_data.new_voyage_name || 'Unknown' }}
                    <span v-if="authRequest.resource_data.new_voyage_internal_code" class="ml-1">({{ authRequest.resource_data.new_voyage_internal_code }})</span>
                  </v-chip>
                </div>
                <div v-if="authRequest.resource_data.new_voyage_eta_date || authRequest.resource_data.new_voyage_arrival_date" class="flex items-center gap-2 mt-1 text-xs text-grey-darken-1">
                  <span v-if="authRequest.resource_data.new_voyage_eta_date">ETA: {{ formatDateString(authRequest.resource_data.new_voyage_eta_date) }}</span>
                  <span v-if="authRequest.resource_data.new_voyage_arrival_date">• Arrival: {{ formatDateString(authRequest.resource_data.new_voyage_arrival_date) }}</span>
                </div>
              </div>
            </td>
            <td>
              <UserInfoBadge :item="authRequest" createdByKey="requested_by">
                <div class="cell-title">{{ authRequest.requested?.name }}</div>
                <div class="cell-sub">{{ formatDateString(authRequest.created_at) }}</div>
              </UserInfoBadge>
            </td>
            <td>
              <ExpandableText
                :text="authRequest.request_reason"
                :lines="3"
                :expanded="expandedComments.has(authRequest.id)"
                @update:expanded="toggleComment(authRequest.id)"
                @truncated="(v: boolean) => setTruncated(authRequest.id, v)"
              />
            </td>
            <td>
              <div v-if="!authRequest.files?.length" class="text-caption text-disabled">No attachments</div>
              <div v-else class="d-flex flex-column gap-1">
                <ButtonDownloadS3Object v-for="(file, fi) in authRequest.files" :key="`file-${fi}`" :s3Path="file.attachment" />
              </div>
            </td>
            <td>
              <RequestStatusCell
                :decision="authRequest.decision"
                :used-at="authRequest.used_at"
                :expired="authRequest.expired"
                :reason="authRequest.decision !== 'pending' ? authRequest.authorized_reason : null"
                :siga-link="authRequest.siga_ticket_link"
              />
              <div v-if="authRequest.authorized?.name" class="cell-sub mt-1">by {{ authRequest.authorized.name }}</div>
            </td>
            <td>
              <span v-if="authRequest.expires_at">{{ formatDateString(authRequest.expires_at) }}</span>
              <span v-else class="text-disabled">—</span>
            </td>
          </tr>
          <tr v-if="!authRequests.data?.length">
            <td colspan="8" class="text-center py-8 text-medium-emphasis">No requests match the current filters.</td>
          </tr>
        </tbody>
      </v-table>
      </v-card>
      <div class="d-flex justify-end mt-2">
        <v-pagination
          v-model="authRequests.current_page"
          :length="authRequests.last_page"
          rounded="circle"
          density="compact"
          :total-visible="7"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </div>

      <GrantDenyDialog
        v-model="showGrantDialog"
        mode="authorization"
        @submit="preGrantAuth"
      >
        <template #context>
          <div class="text-base">Resource: {{ getResourceName(form.auth_request?.resource) }}</div>
          <div class="text-base">Reference: #{{ form.auth_request?.invoice_number || form.auth_request?.resource_id }}</div>
          <div class="text-base">Requested by: {{ form.auth_request?.requested?.name }}</div>
          <div class="text-base">Comments: {{ form.auth_request?.request_reason }}</div>
        </template>
      </GrantDenyDialog>

      <!-- Ticket Chat Dialog -->
      <v-dialog v-model="showChatDrawer" max-width="640">
        <v-card v-if="activeChatTicket" flat style="border-radius:12px;overflow:hidden">
          <TicketChatPanel
            ticket-type="authorization-request"
            :ticket-id="activeChatTicket.id"
            :can-manage="isAdminRole()"
            height="580px"
            @close="showChatDrawer = false"
          />
          <v-divider />
          <v-card-actions v-if="!activeChatTicket.deleted_at" class="px-4 py-2">
            <span class="text-caption text-medium-emphasis">
              #{{ activeChatTicket.id }} &mdash; {{ getResourceName(activeChatTicket.resource) }}
            </span>
            <v-spacer />
            <v-btn
              v-if="isPendingToGrant(activeChatTicket) && hasPermission('authorization-requests-respond')"
              color="primary" variant="flat" size="small"
              @click="showChatDrawer = false; showFormGrant(activeChatTicket)"
            >Respond</v-btn>
            <v-btn
              v-if="canDelete(activeChatTicket)"
              color="error" variant="tonal" size="small"
              @click="showChatDrawer = false; showFormCancel(activeChatTicket)"
            >Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showCancelDialog" max-width="500" persistent>
        <v-card>
          <v-card-title>Cancel authorization request</v-card-title>
          <v-card-text> Please confirm the delete of the authorization request </v-card-text>
          <v-card-actions>
            <div class="grow"></div>
            <v-btn color="error" @click="closeCancelDialog">Cancel</v-btn>
            <v-btn color="success" @click="cancelAuthorization">Yes, I confirm.</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <InvoiceCancellationHistoryModal
        v-model="showHistoryDialog"
        :resource-data="selectedAuthRequest?.resource_data"
        :auth-resource="selectedAuthRequest?.resource"
      />
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { authorizeResources, getAuthResourceByName } from '~/utils/data/system'
import { deletedStatus } from '~/utils/data/systemData'
import InvoiceCancellationHistoryModal from './InvoiceCancellationHistoryModal.vue'
import GrantDenyDialog from './shared/GrantDenyDialog.vue'
import DecisionChip from './shared/DecisionChip.vue'
const { $api } = useNuxtApp()
const { hasPermission, isAdminRole, user: currentUser } = useCheckUser()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const authRequestStore = useAuthRequestStore()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const resourceTypeItems = Object.values(authorizeResources)

const filters = ref({
  id: null,
  search: '',
  deleted_status: 'active',
  decision: null as string | null,
  requestedBy: null,
  resource: null,
  resourceId: '',
})

useDebouncedSearch(() => filters.value.search, () => onClickFilters())

const decisionOptions = [
  { value: null, label: 'All', color: 'primary' },
  { value: 'pending', label: 'Waiting for approval', color: 'warning' },
  { value: 'granted', label: 'Approved', color: 'success' },
  { value: 'denied', label: 'Denied', color: 'error' },
]

const setDecision = (value: string | null) => {
  filters.value.decision = value
  onClickFilters()
}

const catalogs = ref<any>({
  users: [],
})

const formCancel = ref<any>({
  auth_request: null,
  cancel_reason: '',
})

const form = ref<any>({
  auth_request: null,
})

const showChatDrawer = ref(false)
const activeChatTicket = ref<any>(null)

const openChat = (authRequest: any) => {
  activeChatTicket.value = authRequest
  authRequest.unread_count = 0
  showChatDrawer.value = true
}

const authRequests = ref<any>({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const showGrantDialog = ref(false)
const showCancelDialog = ref(false)
const showHistoryDialog = ref(false)
const selectedAuthRequest = ref<any>(null)

const showFormGrant = (authRequest: any) => {
  form.value.auth_request = authRequest
  showGrantDialog.value = true
}

const showFormCancel = (authRequest: any) => {
  formCancel.value.auth_request = authRequest
  showCancelDialog.value = true
}

const hasInvoiceCancellationHistory = (authRequest: any) => {
  const invoiceTypes = ['cancel-invoice-tm', 'cancel-invoice-wm', 'cancel-invoice-tm-air', 'cancel-invoice-wm-air', 'cancel-free-fromat']
  return invoiceTypes.includes(authRequest.resource) && authRequest.resource_data && Object.keys(authRequest.resource_data).length > 0
}

const openHistoryDialog = (authRequest: any) => {
  selectedAuthRequest.value = authRequest
  showHistoryDialog.value = true
}

const onClickPagination = async (page: number) => {
  authRequests.value.current_page = page
  await getAuthRequests()
}

const isPendingToGrant = (authRequest: any) => {
  return authRequest.is_authorized == null
}

// TODO: Unused functions
const priorityColor = (priority: string) => {
  return { critical: 'error', high: 'deep-orange', medium: 'warning', low: 'default' }[priority] ?? 'default'
}
const ticketStatusColor = (status: string) => {
  return { open: 'primary', pending_info: 'warning', in_review: 'info', resolved: 'success', closed: 'default' }[status] ?? 'primary'
}

const getResourceName = (resource: string) => {
  // find resource name in authorizeResources
  return getAuthResourceByName(resource)?.description
}

const preGrantAuth = async (payload: any) => {
  const isAuthorized = payload.decision === 'granted'
  const resource = getAuthResourceByName(form.value.auth_request.resource)
  if (isAuthorized && resource?.redirect) {
    authRequestStore.setAuthRequest({
      auth_request: form.value.auth_request,
      is_authorized: 1,
      until_date: payload.untilDate,
      authorized_reason: payload.reason,
      temp_permission_enabled: payload.tempPermissionEnabled ?? false,
      temp_valid_from: payload.tempValidFrom ?? null,
      temp_valid_until: payload.tempValidUntil ?? null,
    })
    router.push(resource.redirect)
    return
  }
  await grantAuthorization(payload)
}

const grantAuthorization = async (payload: any) => {
  try {
    loadingStore.loading = true
    const body = {
      id: form.value.auth_request.id,
      is_authorized: payload.decision === 'granted' ? 1 : 0,
      until_date: payload.untilDate,
      authorized_reason: payload.reason,
      temp_permission_enabled: payload.tempPermissionEnabled ?? false,
      temp_valid_from: payload.tempValidFrom ?? null,
      temp_valid_until: payload.tempValidUntil ?? null,
    }
    await $api.authRequests.respondRequest(form.value.auth_request.id, body)

    snackbar.add({ type: 'success', text: 'Authorization request response sent' })
    closeGrantDialog()
    await getAuthRequests()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const canDelete = (authRequest: any) => {
  if (!authRequest) return false
  if (!isAdminRole()) return false
  if (!isPendingToGrant(authRequest) && hasPermission('authorization-requests-delete')) {
    return true
  }
  if (isPendingToGrant(authRequest) && authRequest.requested_by === currentUser.value?.id) {
    return true
  }
  return false
}

const cancelAuthorization = async () => {
  try {
    loadingStore.loading = true
    const useCancelAuth = !hasPermission('authorization-requests-delete') &&
                          formCancel.value.auth_request?.requested_by === currentUser.value?.id

    if (useCancelAuth) {
      await $api.authRequests.cancelAuth(formCancel.value.auth_request.id, {
        cancel_reason: formCancel.value.cancel_reason,
      })
    } else {
      await $api.authRequests.cancelRequest(formCancel.value.auth_request.id, {
        cancel_reason: formCancel.value.cancel_reason,
      })
    }

    snackbar.add({ type: 'success', text: 'Authorization request canceled' })
    closeCancelDialog()
    await getAuthRequests()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const closeGrantDialog = () => {
  showGrantDialog.value = false
  form.value = { auth_request: null }
}

const closeCancelDialog = () => {
  showCancelDialog.value = false
  formCancel.value = {
    auth_request: null,
    cancel_reason: '',
  }
}

const onClickFilters = async () => {
  // set current page to 1
  authRequests.value.current_page = 1
  await getAuthRequests()
}

const getAuthRequests = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.authRequests.getRequests({
      query: {
        page: authRequests.value.current_page,
        perPage: authRequests.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    authRequests.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

const getAuthReqCatalogs = async () => {
  const response = await $api.authRequests.getCatalogs()

  catalogs.value = response as any
}

const clearFilters = async () => {
  filters.value = {
    id: null,
    search: '',
    deleted_status: 'active',
    decision: null,
    requestedBy: null,
    resource: null,
    resourceId: '',
  }
  authRequests.value.current_page = 1
  await getAuthRequests()
}

onMounted(async () => {
  await getAuthRequests()
  await getAuthReqCatalogs()
  openChatFromQuery()
})

const openChatFromQuery = () => {
  const ticketId = route.query.ticketId ? Number(route.query.ticketId) : null
  if (!ticketId || route.query.openChat !== '1') return
  const row = authRequests.value.data.find((r: any) => r.id === ticketId)
  openChat(row ?? { id: ticketId })
  router.replace({ query: { ...route.query, openChat: undefined, ticketId: undefined } })
}

watch(() => route.query.openChat, (val) => {
  if (val === '1') openChatFromQuery()
})

// ── Collapsible reasons ───────────────────────────────────────────────────

const expandedComments = ref<Set<number>>(new Set())
const truncatable = ref<Set<number>>(new Set())

const toggleComment = (id: number) => {
  const next = new Set(expandedComments.value)
  if (!next.delete(id)) next.add(id)
  expandedComments.value = next
}

const setTruncated = (id: number, value: boolean) => {
  const next = new Set(truncatable.value)
  if (value) next.add(id)
  else next.delete(id)
  truncatable.value = next
}

const allExpanded = computed(
  () => truncatable.value.size > 0 && [...truncatable.value].every((id) => expandedComments.value.has(id)),
)

const toggleAll = () => {
  expandedComments.value = allExpanded.value ? new Set() : new Set(truncatable.value)
}
</script>
