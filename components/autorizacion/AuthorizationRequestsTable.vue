<template>
  <v-card variant="flat">
    <v-card-text>
      <div class="mb-4" @keyup.enter="onClickFilters">
        <div class="grid grid-cols-6 gap-4">
          <div class="col-span-2">
            <v-text-field v-model="filters.id" type="number" density="compact" label="By ID" />
          </div>
          <div class="col-span-2">
            <v-text-field v-model="filters.search" density="compact" label="Search in comments" />
          </div>
          <div class="col-span-2">
            <v-autocomplete
              v-model="filters.requestedBy"
              :items="catalogs.users"
              item-title="name"
              item-value="id"
              density="compact"
              label="Requested by"
            />
          </div>
          <div class="col-span-2">
            <v-autocomplete
              density="compact"
              label="Status"
              v-model="filters.deleted_status"
              :items="deletedStatus"
              item-title="name"
              item-value="value"
              hide-details
            />
          </div>
          <div class="col-span-2">
            <v-autocomplete
              v-model="filters.resource"
              :items="resourceTypeItems"
              item-title="description"
              item-value="resource"
              density="compact"
              label="Resource type"
              clearable
            />
          </div>
          <div class="col-span-2">
            <v-text-field v-model="filters.resourceId" density="compact" label="Reference / Invoice #" clearable />
          </div>
        </div>
        <div class="grid grid-cols-1 pt-4">
          <div class="flex gap-2">
            <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
            <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
          </div>
        </div>
      </div>

      <v-pagination
        v-model="authRequests.current_page"
        :length="authRequests.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
      <div class="text-xs">
        Showing {{ authRequests.from }} to {{ authRequests.to }} from {{ authRequests.total }} total records
      </div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left" width="20">ID</th>
            <th class="text-left" width="50">Chat</th>
            <th class="text-left">Requested by</th>
            <th class="text-left">Resource</th>
            <th class="text-left">
              <div class="d-flex align-center gap-1">
                Comments
                <v-btn
                  size="x-small"
                  variant="text"
                  :icon="allExpanded ? 'mdi-arrow-collapse-vertical' : 'mdi-arrow-expand-vertical'"
                  :title="allExpanded ? 'Collapse all' : 'Expand all'"
                  @click="toggleAll"
                />
              </div>
            </th>
            <th class="text-left">Attachment(s)</th>
            <th v-show="false" class="text-left">Resource</th>
            <th v-show="false" class="text-left">Resource ID</th>
            <th class="text-left">Granted?</th>
            <th class="text-left">Used?</th>
            <th class="text-left">Expired?</th>
            <th class="text-left">Expiration date</th>
            <th class="text-left">User auth</th>
            <th class="text-left">Created at</th>
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
            <td>{{ authRequest.id }}</td>
            <td>
              <v-btn icon size="small" variant="text" color="primary" @click="openChat(authRequest)">
                <v-icon>mdi-message-text-outline</v-icon>
              </v-btn>
            </td>
            <td class="whitespace-nowrap">{{ authRequest.requested?.name }}</td>
            <td class="whitespace-nowrap">
              {{ getResourceName(authRequest.resource) }} #{{ authRequest.invoice_number || authRequest.resource_id }}
            </td>
            <td style="max-width: 280px;">
              <div v-if="authRequest.request_reason">
                <div
                  class="comment-text text-body-2"
                  :class="{ 'comment-collapsed': !isExpanded(authRequest.id) }"
                >{{ authRequest.request_reason }}</div>
                <button
                  v-if="authRequest.request_reason.length > 80"
                  class="comment-toggle-btn text-caption"
                  :class="isExpanded(authRequest.id) ? 'text-grey-darken-1' : 'text-primary'"
                  @click.stop="toggleComment(authRequest.id)"
                >
                  <span v-if="!isExpanded(authRequest.id)">
                    <v-icon size="12">mdi-chevron-down</v-icon> Show more
                  </span>
                  <span v-else>
                    <v-icon size="12">mdi-chevron-up</v-icon> Show less
                  </span>
                </button>
              </div>
              <span v-else class="text-caption text-grey">—</span>
            </td>
            <td>
              <div v-if="authRequest.files.length <= 0">
                <v-chip size="small" color="warning">No attachments</v-chip>
              </div>
              <div v-if="authRequest.files.length > 0">
                <div v-for="(file, index) in authRequest.files" :key="`file-${index}`">
                  <ButtonDownloadS3Object :s3Path="file.attachment" />
                </div>
              </div>
            </td>

            <td v-show="false">{{ authRequest.resource }}</td>
            <td v-show="false">{{ authRequest.resource_id }}</td>
            <td>
              <div v-if="authRequest.is_authorized == null">
                <v-chip size="small" color="warning">Pending</v-chip>
              </div>
              <div v-else>
                <v-chip size="small" color="success" v-if="authRequest.is_authorized == 1">Yes</v-chip>
                <v-chip size="small" color="error" v-else>No</v-chip>
                <div>{{ authRequest.authorized_reason }}</div>
              </div>
            </td>
            <td>
              <div v-if="authRequest.used_at">
                <v-chip size="small" color="primary" v-if="authRequest.used_at">
                  {{ formatDateString(authRequest.used_at) }}
                </v-chip>
              </div>
            </td>
            <td>
              <div v-if="!authRequest.used_at">
                <v-chip size="small" color="primary">
                  {{ authRequest.expired ? 'Yes' : 'No' }}
                </v-chip>
              </div>
            </td>
            <td>{{ formatDateString(authRequest.expires_at) }}</td>
            <td class="whitespace-nowrap">{{ authRequest.authorized?.name }}</td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="authRequest" createdByKey="requested_by">
                {{ formatDateString(authRequest.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="authRequests.current_page"
        :length="authRequests.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>

      <v-dialog v-model="showGrantDialog" max-width="560" persistent>
        <v-card>
          <v-card-title>Grant authorization</v-card-title>
          <v-card-text>
            <div class="border-4 border-dotted border-gray-300 p-2 mb-4">
              <div class="text-base">Resource: {{ getResourceName(form.auth_request?.resource) }}</div>
              <div class="text-base">Reference: #{{ form.auth_request?.invoice_number || form.auth_request?.resource_id }}</div>
              <div class="text-base">Requested by: {{ form.auth_request?.requested?.name }}</div>
              <div class="text-base">Comments: {{ form.auth_request?.request_reason }}</div>
            </div>
            <v-autocomplete
              v-model="form.is_authorized"
              :items="[
                { text: '', value: null },
                { text: 'Yes', value: 1 },
                { text: 'No', value: 0 },
              ]"
              item-title="text"
              item-value="value"
              label="Grant or reject?"
            />
            <v-text-field
              v-if="form.is_authorized == 1"
              v-model="form.until_date"
              type="date"
              label="Until date granted"
            />
            <v-textarea v-model="form.authorized_reason" label="Comments" />

            <!-- Temporary permission (opt-in, only when granting) -->
            <template v-if="form.is_authorized == 1">
              <v-divider class="my-3" />
              <div class="d-flex align-center mb-2">
                <v-switch
                  v-model="form.temp_permission_enabled"
                  hide-details
                  density="compact"
                  color="warning"
                  class="mr-2"
                />
                <div>
                  <div class="text-body-2 font-weight-medium">Temporary permission</div>
                  <div class="text-caption text-medium-emphasis">Allow user to repeat this action on multiple entities without new requests</div>
                </div>
              </div>
              <template v-if="form.temp_permission_enabled">
                <div class="grid grid-cols-2 gap-3">
                  <v-text-field
                    v-model="form.temp_valid_from"
                    type="datetime-local"
                    label="Valid from"
                    density="compact"
                  />
                  <v-text-field
                    v-model="form.temp_valid_until"
                    type="datetime-local"
                    label="Valid until"
                    density="compact"
                  />
                </div>
              </template>
            </template>
          </v-card-text>
          <v-card-actions>
            <div class="grow"></div>
            <v-btn color="error" @click="closeGrantDialog">Cancel</v-btn>
            <v-btn color="success" @click="preGrantAuth">Save response</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Ticket Chat Dialog -->
      <v-dialog v-model="showChatDrawer" max-width="640">
        <v-card v-if="activeChatTicket" flat style="border-radius:12px;overflow:hidden">
          <TicketChatPanel
            ticket-type="authorization-request"
            :ticket-id="activeChatTicket.id"
            :can-manage="true"
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
              v-if="isPendingToGrant(activeChatTicket)"
              color="primary" variant="flat" size="small"
              @click="showChatDrawer = false; showFormGrant(activeChatTicket)"
            >Respond</v-btn>
            <v-btn
              v-else
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
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { authorizeResources, getAuthResourceByName } from '~/utils/data/system'
import { deletedStatus } from '~/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const authRequestStore = useAuthRequestStore()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const resourceTypeItems = Object.values(authorizeResources)

const filters = ref({
  id: null,
  search: '',
  deleted_status: 'active',
  requestedBy: null,
  resource: null,
  resourceId: '',
})

const catalogs = ref<any>({
  users: [],
})

const formCancel = ref<any>({
  auth_request: null,
  cancel_reason: '',
})

const form = ref<any>({
  auth_request: null,
  until_date: null,
  is_authorized: null,
  authorized_reason: '',
  temp_permission_enabled: false,
  temp_valid_from: null,
  temp_valid_until: null,
})

const showChatDrawer = ref(false)
const activeChatTicket = ref<any>(null)

const openChat = (authRequest: any) => {
  activeChatTicket.value = authRequest
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
  await getAuthRequests()
}

const isPendingToGrant = (authRequest: any) => {
  return authRequest.is_authorized == null
}

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

const preGrantAuth = async () => {
  if (form.value.is_authorized == null) {
    snackbar.add({ type: 'error', text: 'Please provide a response for the authorization request' })
    return
  }

  const isAuthorized = form.value.is_authorized == 1
  const resource = getAuthResourceByName(form.value.auth_request.resource)
  if (isAuthorized && resource?.redirect) {
    // authRequestStore.setAuthRequest(form.value)

    // const body = JSON.parse(JSON.stringify(form.value))
    // console.log('body', body)
    authRequestStore.setAuthRequest(form.value)
    router.push(resource.redirect)
    return
  }
  await grantAuthorization()
}

const grantAuthorization = async () => {
  try {
    if (form.value.is_authorized == null) {
      snackbar.add({ type: 'error', text: 'Please provide a response for the authorization request' })
      return
    }
    loadingStore.loading = true
    const body = {
      id: form.value.auth_request.id,
      is_authorized: form.value.is_authorized,
      until_date: form.value.until_date,
      authorized_reason: form.value.authorized_reason,
      temp_permission_enabled: form.value.temp_permission_enabled ?? false,
      temp_valid_from: form.value.temp_valid_from ?? null,
      temp_valid_until: form.value.temp_valid_until ?? null,
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

const cancelAuthorization = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.authRequests.cancelRequest(formCancel.value.auth_request.id, {
      cancel_reason: formCancel.value.cancel_reason,
    })

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
  form.value = {
    auth_request: null,
    until_date: null,
    is_authorized: null,
    authorized_reason: '',
    temp_permission_enabled: false,
    temp_valid_from: null,
    temp_valid_until: null,
  }
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
})

// ── Collapsible Comments ──────────────────────────────────────────────────

const expandedComments = ref<Set<number>>(new Set())

const isExpanded = (id: number) => expandedComments.value.has(id)

const toggleComment = (id: number) => {
  const s = new Set(expandedComments.value)
  if (s.has(id)) {
    s.delete(id)
  } else {
    s.add(id)
  }
  expandedComments.value = s
}

const allExpanded = computed(() => {
  const ids = (authRequests.value.data as any[])
    .filter((r: any) => r.request_reason?.length > 80)
    .map((r: any) => r.id)
  return ids.length > 0 && ids.every((id: number) => expandedComments.value.has(id))
})

const toggleAll = () => {
  const ids = (authRequests.value.data as any[])
    .filter((r: any) => r.request_reason?.length > 80)
    .map((r: any) => r.id)
  if (allExpanded.value) {
    expandedComments.value = new Set()
  } else {
    expandedComments.value = new Set(ids)
  }
}
</script>

<style scoped>
.comment-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.45;
}

.comment-collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
}

.comment-toggle-btn {
  background: none;
  border: none;
  padding: 2px 0 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-family: inherit;
  transition: opacity 0.15s;
}

.comment-toggle-btn:hover {
  opacity: 0.75;
}
</style>
