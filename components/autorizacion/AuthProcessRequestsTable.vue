<template>
  <v-card variant="flat">
    <v-card-text class="px-0">
      <RequestFilterCard @search="onClickFilters" @clear="clearFilters">
        <v-text-field
          v-model="filters.search"
          class="req-filters__wide"
          density="compact"
          label="Search"
          placeholder="Reason, process, target, requester or approver…"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
        />
        <v-text-field v-model="filters.id" type="number" density="compact" label="Request ID" hide-details />
        <v-autocomplete
          density="compact"
          label="Process type"
          v-model="filters.process_name"
          :items="processTypeItems"
          item-title="description"
          item-value="processName"
          clearable
          hide-details
        />
        <div v-if="isAdminRole()">
          <AUserSearch v-model="filters.user_id" label="Requested by" />
        </div>
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
            v-for="opt in statusOptions"
            :key="opt.value ?? 'all'"
            size="small"
            :color="opt.color"
            :variant="filters.status === opt.value ? 'flat' : 'tonal'"
            @click="setStatus(opt.value)"
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
          <col style="width: 150px" />
          <col style="width: 280px" />
          <col style="width: 180px" />
          <col style="width: 320px" />
          <col style="width: 190px" />
          <col style="width: 130px" />
        </colgroup>
        <thead>
          <tr>
            <th class="text-left">ID</th>
            <th class="text-left">Actions</th>
            <th class="text-left">Process</th>
            <th class="text-left">Requested by</th>
            <th class="text-left">Reason &amp; details</th>
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
                  <v-badge v-if="authRequest.unread_count" :content="authRequest.unread_count" color="error" overlap>
                    <v-icon>mdi-message-text-outline</v-icon>
                  </v-badge>
                  <v-icon v-else>mdi-message-text-outline</v-icon>
                </v-btn>
                <v-btn
                  v-if="isPendingToGrant(authRequest) && hasPermission('process-requests-respond')"
                  icon
                  size="small"
                  variant="text"
                  color="success"
                  title="Approve or deny"
                  @click="showFormGrant(authRequest)"
                >
                  <v-icon>mdi-check-circle-outline</v-icon>
                </v-btn>
                <v-btn
                  v-if="canDelete(authRequest)"
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  title="Cancel request"
                  @click="showFormCancel(authRequest)"
                >
                  <v-icon>mdi-close-circle-outline</v-icon>
                </v-btn>
                <v-btn
                  v-if="authRequest.process_data"
                  icon
                  size="small"
                  variant="text"
                  color="secondary"
                  title="View request data"
                  @click="showDetails(authRequest)"
                >
                  <v-icon>mdi-information-outline</v-icon>
                </v-btn>
              </div>
            </td>
            <td>
              <div class="cell-title">{{ authRequest.resolved_display }}</div>
            </td>
            <td>
              <UserInfoBadge :item="authRequest" createdByKey="user_id">
                <div class="cell-title">{{ authRequest.user?.name }}</div>
                <div class="cell-sub">{{ formatDateString(authRequest.created_at) }}</div>
              </UserInfoBadge>
            </td>
            <td>
              <ExpandableText :text="authRequest.reason" :lines="3" empty="No comments" />
              <v-btn
                v-if="authRequest.process_data"
                size="x-small"
                variant="tonal"
                color="secondary"
                class="mt-1"
                prepend-icon="mdi-eye-outline"
                @click="showDetails(authRequest)"
              >
                View data
              </v-btn>
              <!-- Supporting documents -->
              <div v-if="authRequest.files?.length" class="mt-1 d-flex flex-wrap ga-1">
                <ButtonDownloadS3Object
                  v-for="(file, fi) in authRequest.files"
                  :key="`file-${fi}`"
                  :s3Path="file.attachment"
                />
              </div>
            </td>
            <td>
              <RequestStatusCell
                :decision="authRequest.decision"
                :used-at="authRequest.used_at"
                :expired="isExpired(authRequest)"
                :reason="authRequest.deleted_at ? authRequest.reason_deleted : authRequest.decision !== 'pending' ? authRequest.response : null"
                :withdrawn="!!authRequest.deleted_at"
                :siga-link="authRequest.siga_ticket_link"
              />
              <div v-if="authRequest.grantor?.name" class="cell-sub mt-1">by {{ authRequest.grantor.name }}</div>
            </td>
            <td>
              <span v-if="authRequest.expires_at">{{ formatDateString(authRequest.expires_at) }}</span>
              <span v-else class="text-disabled">—</span>
            </td>
          </tr>
          <tr v-if="!authRequests.data?.length">
            <td colspan="7" class="text-center py-8 text-medium-emphasis">No requests match the current filters.</td>
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
        mode="process"
        :min-expires-at="minExpiresAt"
        @submit="preGrantAuth"
      >
        <template #context>
          <div class="text-base">Process: {{ form.auth_request?.resolved_display }}</div>
          <div class="text-base">Requested by: {{ form.auth_request?.user?.name }}</div>
          <div class="text-base">Comments: {{ form.auth_request?.reason || 'No comments' }}</div>
          <template v-if="form.auth_request?.process_data">
            <v-divider class="my-2" />
            <div class="text-sm font-semibold mb-1">Request details:</div>
            <ProcessRequestDetails :process-data="form.auth_request.process_data_resolved ?? form.auth_request.process_data" :summary="form.auth_request.charge_summary" />
          </template>
        </template>
      </GrantDenyDialog>

      <!-- Request Data Details Dialog -->
      <v-dialog v-model="showDetailsDialog" max-width="640">
        <v-card v-if="detailsRequest">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-information-outline</v-icon>
            Request data — #{{ detailsRequest.id }}
          </v-card-title>
          <v-card-subtitle>{{ detailsRequest.resolved_display }}</v-card-subtitle>
          <v-card-text>
            <div class="text-sm mb-2">
              <span class="font-medium">Requested by:</span> {{ detailsRequest.user?.name }}
            </div>
            <div class="text-sm mb-3">
              <span class="font-medium">Comments:</span> {{ detailsRequest.reason || 'No comments' }}
            </div>
            <v-divider class="mb-3" />
            <ProcessRequestDetails :process-data="detailsRequest.process_data_resolved ?? detailsRequest.process_data" :summary="detailsRequest.charge_summary" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="showDetailsDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Ticket Chat Dialog -->
      <v-dialog v-model="showChatDrawer" max-width="640">
        <v-card v-if="activeChatTicket" flat style="border-radius: 12px; overflow: hidden">
          <TicketChatPanel
            ticket-type="process-request"
            :ticket-id="activeChatTicket.id"
            :can-manage="isAdminRole()"
            height="580px"
            @close="showChatDrawer = false"
          />
          <v-divider />
          <v-card-actions v-if="!activeChatTicket.deleted_at" class="px-4 py-2">
            <span class="text-caption text-medium-emphasis">
              #{{ activeChatTicket.id }} &mdash; {{ activeChatTicket.resolved_display }}
            </span>
            <v-spacer />
            <v-btn
              v-if="isPendingToGrant(activeChatTicket) && hasPermission('process-requests-respond')"
              color="primary"
              variant="flat"
              size="small"
              @click="
                () => {
                  showChatDrawer = false
                  showFormGrant(activeChatTicket)
                }
              "
              >Respond</v-btn
            >
            <v-btn
              v-if="canDelete(activeChatTicket)"
              color="error"
              variant="tonal"
              size="small"
              @click="
                () => {
                  showChatDrawer = false
                  showFormCancel(activeChatTicket)
                }
              "
              >Delete</v-btn
            >
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
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { processResources } from '~/utils/data/system'
import { deletedStatus } from '~/utils/data/systemData'
import GrantDenyDialog from './shared/GrantDenyDialog.vue'
import DecisionChip from './shared/DecisionChip.vue'
import ProcessRequestDetails from './shared/ProcessRequestDetails.vue'
const { $api } = useNuxtApp()
const { isAdminRole, hasPermission, user: currentUser } = useCheckUser()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const processTypeItems = Object.values(processResources)

const filters = ref<any>({
  id: null,
  search: '',
  deleted_status: 'active',
  user_id: null,
  process_name: null,
  status: null,
})

const catalogs = ref<any>({
  users: [],
})

const estatuses = ref<any>([
  { name: 'Pending', value: 'pending' },
  { name: 'Granted', value: 'granted' },
  { name: 'Denied', value: 'denied' },
])

useDebouncedSearch(() => filters.value.search, () => onClickFilters())

const statusOptions = [
  { value: null, label: 'All', color: 'primary' },
  { value: 'pending', label: 'Waiting for approval', color: 'warning' },
  { value: 'granted', label: 'Approved', color: 'success' },
  { value: 'denied', label: 'Denied', color: 'error' },
]

const setStatus = (value: string | null) => {
  filters.value.status = value
  onClickFilters()
}

const isExpired = (authRequest: any) =>
  !authRequest.used_at && !!authRequest.expires_at && new Date(authRequest.expires_at) < new Date()

const formCancel = ref<any>({
  auth_request: null,
  cancel_reason: '',
})

const form = ref<any>({
  auth_request: null,
})

const minExpiresAt = computed(() => {
  const now = new Date()
  const tzoffset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16)
})

const authRequests = ref<any>({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const showGrantDialog = ref(false)
const showCancelDialog = ref(false)

const showFormGrant = (authRequest: any) => {
  form.value.auth_request = authRequest
  showGrantDialog.value = true
}

const showFormCancel = (authRequest: any) => {
  formCancel.value.auth_request = authRequest
  showCancelDialog.value = true
}

const onClickPagination = async (page: number) => {
  authRequests.value.current_page = page
  await getAuthProcessRequests()
}

const isPendingToGrant = (authRequest: any) => {
  return authRequest.status == 'pending'
}

const showDetailsDialog = ref(false)
const detailsRequest = ref<any>(null)

const showDetails = (authRequest: any) => {
  detailsRequest.value = authRequest
  showDetailsDialog.value = true
}

const showChatDrawer = ref(false)
const activeChatTicket = ref<any>(null)

const openChat = (req: any) => {
  activeChatTicket.value = req
  req.unread_count = 0
  showChatDrawer.value = true
}

// TODO: Unused functions
const priorityColor = (priority: string) => {
  return { critical: 'error', high: 'deep-orange', medium: 'warning', low: 'default' }[priority] ?? 'default'
}
const ticketStatusColor = (status: string) => {
  return { open: 'primary', pending_info: 'warning', in_review: 'info', resolved: 'success', closed: 'default' }[status] ?? 'primary'
}

const preGrantAuth = async (payload: any) => {
  if (payload.decision === 'granted') {
    if (!payload.expiresAt) {
      snackbar.add({ type: 'error', text: 'Please provide an expiration date' })
      return
    }
    const expiresAt = new Date(payload.expiresAt)
    if (expiresAt <= new Date()) {
      snackbar.add({ type: 'error', text: 'Expiration date must be in the future' })
      return
    }
  }
  await grantAuthorization(payload)
}

const grantAuthorization = async (payload: any) => {
  try {
    loadingStore.loading = true
    const body = {
      id: form.value.auth_request.id,
      status: payload.decision,
      expires_at: payload.expiresAt,
      response: payload.reason,
    }
    await $api.authProcessRequests.respondRequest(form.value.auth_request.id, body)

    snackbar.add({ type: 'success', text: 'Authorization process request response sent' })
    closeGrantDialog()
    await getAuthProcessRequests()
  } catch (e: any) {
    console.error(e)
    const msg = e?.response?._data?.message || 'Error responding to authorization request'
    snackbar.add({ type: 'error', text: msg })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const canDelete = (authRequest: any) => {
  if (!authRequest) return false
  if (!isAdminRole()) return false
  if (!isPendingToGrant(authRequest) && hasPermission('process-requests-delete')) {
    return true
  }
  if (isPendingToGrant(authRequest) && authRequest.user_id === currentUser.value?.id) {
    return true
  }
  return false
}

const cancelAuthorization = async () => {
  try {
    loadingStore.loading = true
    const useCancelAuth =
      !hasPermission('process-requests-delete') && formCancel.value.auth_request?.user_id === currentUser.value?.id

    if (useCancelAuth) {
      await $api.authProcessRequests.cancelAuth(formCancel.value.auth_request.id, {
        cancel_reason: formCancel.value.cancel_reason,
      })
    } else {
      await $api.authProcessRequests.cancelRequest(formCancel.value.auth_request.id, {
        cancel_reason: formCancel.value.cancel_reason,
      })
    }

    snackbar.add({ type: 'success', text: 'Authorization request canceled' })
    closeCancelDialog()
    await getAuthProcessRequests()
  } catch (e: any) {
    console.error(e)
    const msg = e?.response?._data?.message || 'Error canceling authorization request'
    snackbar.add({ type: 'error', text: msg })
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
  await getAuthProcessRequests()
}

const getAuthProcessRequests = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.authProcessRequests.getRequests({
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

const getAuthReqProcessCatalogs = async () => {
  const response = await $api.authProcessRequests.getCatalogs()

  catalogs.value = response as any
}

const clearFilters = async () => {
  filters.value = {
    id: null,
    search: '',
    deleted_status: 'active',
    user_id: null,
    process_name: null,
    status: null,
  }
  authRequests.value.current_page = 1
  await getAuthProcessRequests()
}

onMounted(async () => {
  await getAuthProcessRequests()
  await getAuthReqProcessCatalogs()
  openChatFromQuery()
})

const openChatFromQuery = () => {
  const ticketId = route.query.ticketId ? Number(route.query.ticketId) : null
  if (!ticketId || route.query.openChat !== '1') return
  const row = authRequests.value.data.find((r: any) => r.id === ticketId)
  openChat(row ?? { id: ticketId })
  router.replace({ query: { ...route.query, openChat: undefined, ticketId: undefined } })
}

watch(
  () => route.query.openChat,
  (val) => {
    if (val === '1') openChatFromQuery()
  },
)
</script>
