<template>
  <v-card variant="flat">
    <v-card-text>
      <div class="mb-4" @keyup.enter="onClickFilters">
        <div class="grid grid-cols-6 gap-4">
          <div v-if="isAdminRole()" class="col-span-2">
            <AUserSearch v-model="filters.user_id" label="Requested by" />
          </div>
          <div class="col-span-2">
            <v-text-field v-model="filters.id" type="number" density="compact" label="By ID" />
          </div>
          <div class="col-span-2">
            <v-autocomplete
              density="compact"
              label="Status"
              v-model="filters.status"
              :items="estatuses"
              item-title="name"
              item-value="value"
              hide-details
            />
          </div>
          <div class="col-span-2">
            <v-autocomplete
              density="compact"
              label="Active / Inactive"
              v-model="filters.deleted_status"
              :items="deletedStatus"
              item-title="name"
              item-value="value"
              hide-details
            />
          </div>
          <div class="col-span-2">
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
            <th class="text-left">Process</th>
            <th class="text-left">Reason</th>
            <th class="text-left">Status</th>
            <th class="text-left">Expiration date</th>
            <th class="text-left">Granted by</th>
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
              <div class="d-flex gap-1">
                <v-btn icon size="small" variant="text" color="primary" @click="openChat(authRequest)">
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
                  v-if="isPendingToGrant(authRequest) && hasPermission('process-requests-respond')"
                  icon size="small" variant="text" color="primary"
                  title="Respond"
                  @click="showFormGrant(authRequest)"
                >
                  <v-icon>mdi-check-circle-outline</v-icon>
                </v-btn>
                <v-btn
                  v-if="canDelete(authRequest)"
                  icon size="small" variant="text" color="error"
                  title="Cancel"
                  @click="showFormCancel(authRequest)"
                >
                  <v-icon>mdi-close-circle-outline</v-icon>
                </v-btn>
              </div>
            </td>
            <td class="whitespace-nowrap">{{ authRequest.user?.name }}</td>
            <td class="whitespace-nowrap">
              {{ authRequest.resolved_display }}
            </td>
            <td>
              <div class="whitespace-nowrap">{{ authRequest.reason || 'No comments' }}</div>
              <template v-if="authRequest.process_data?.charges?.length">
                <div class="mt-1 divide-y divide-gray-100 rounded border border-gray-200 overflow-hidden">
                  <div v-for="(c, ci) in authRequest.process_data.charges" :key="ci" class="flex items-center gap-2 px-2 py-1 text-xs bg-gray-50">
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-gray-800 truncate">{{ c.charge_name }}</div>
                      <div v-if="c.invoice_number" class="text-gray-400">Invoice #{{ c.invoice_number }}</div>
                    </div>
                    <div class="font-semibold text-gray-700 whitespace-nowrap">${{ Number(c.amount).toFixed(2) }}</div>
                  </div>
                </div>
              </template>
              <template v-else-if="authRequest.process_data?.operations?.length">
                <div class="mt-1 divide-y divide-gray-100 rounded border border-gray-200 overflow-hidden">
                  <div v-for="(op, oi) in authRequest.process_data.operations" :key="oi" class="px-2 py-1 text-xs bg-gray-50">
                    <span class="font-semibold capitalize">{{ op.action }}</span>
                    <span class="ml-1">{{ describeOperation(op) }}</span>
                  </div>
                </div>
              </template>
              <template v-else-if="authRequest.process_data">
                <div v-for="(val, key) in authRequest.process_data" :key="key" class="text-xs text-gray-600 whitespace-nowrap">
                  <span class="font-semibold capitalize">{{ String(key).replace(/_/g, ' ') }}:</span> {{ val }}
                </div>
              </template>
            </td>

            <td>
              <v-chip size="x-small" color="amber">{{ authRequest.status }}</v-chip>
            </td>
            <td>{{ formatDateString(authRequest.expires_at) }}</td>
            <td class="whitespace-nowrap">{{ authRequest.grantor?.name }}</td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="authRequest" createdByKey="user_id">
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

      <v-dialog v-model="showGrantDialog" max-width="500" persistent>
        <v-card>
          <v-card-title>Grant process authorization</v-card-title>
          <v-card-text>
            <div class="border-4 border-dotted border-gray-300 p-2 mb-4">
              <div class="text-base">Process: {{ form.auth_request?.resolved_display }}</div>
              <div class="text-base">Requested by: {{ form.auth_request?.user?.name }}</div>
              <div class="text-base">Comments: {{ form.auth_request?.reason || 'No comments' }}</div>
              <template v-if="form.auth_request?.process_data">
                <v-divider class="my-2" />
                <div class="text-sm font-semibold mb-1">Request details:</div>
                <template v-if="form.auth_request.process_data.charges?.length">
                  <div class="divide-y divide-gray-100 rounded border border-gray-200 overflow-hidden">
                    <div v-for="(c, ci) in form.auth_request.process_data.charges" :key="ci" class="flex items-center gap-2 px-2 py-1.5 text-sm bg-gray-50">
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-900 truncate">{{ c.charge_name }}</div>
                        <div v-if="c.invoice_number" class="text-xs text-gray-400">Invoice #{{ c.invoice_number }}</div>
                      </div>
                      <div class="font-semibold text-gray-700 whitespace-nowrap">${{ Number(c.amount).toFixed(2) }}</div>
                    </div>
                  </div>
                </template>
                <template v-else-if="form.auth_request.process_data.operations?.length">
                  <div class="divide-y divide-gray-100 rounded border border-gray-200 overflow-hidden">
                    <div v-for="(op, oi) in form.auth_request.process_data.operations" :key="oi" class="px-2 py-1.5 text-sm bg-gray-50">
                      <span class="font-medium capitalize">{{ op.action }}</span>
                      <span class="ml-1">{{ describeOperation(op) }}</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div v-for="(val, key) in form.auth_request.process_data" :key="key" class="text-sm">
                    <span class="font-medium capitalize">{{ String(key).replace(/_/g, ' ') }}:</span>
                    <span class="ml-1">{{ val }}</span>
                  </div>
                </template>
              </template>
            </div>
            <v-autocomplete
              v-model="form.status"
              :items="[
                { text: 'Pending', value: 'pending' },
                { text: 'Grant', value: 'granted' },
                { text: 'Deny', value: 'denied' },
              ]"
              item-title="text"
              item-value="value"
              label="Grant or deny?"
            />
            <v-text-field
              v-if="form.status == 'granted'"
              v-model="form.expires_at"
              type="datetime-local"
              label="Expires at"
              hint="Please provide an expiration date for the authorization"
            />
            <v-textarea v-model="form.authorized_reason" label="Comments" :rows="3" />
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
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { processResources } from '~/utils/data/system'
import { deletedStatus } from '~/utils/data/systemData'
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

const formCancel = ref<any>({
  auth_request: null,
  cancel_reason: '',
})

const form = ref<any>({
  auth_request: null,
  expires_at: null,
  is_authorized: null,
  authorized_reason: '',
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

const preGrantAuth = async () => {
  if (form.value.status == null) {
    snackbar.add({ type: 'error', text: 'Please provide a response for the authorization request' })
    return
  }
  await grantAuthorization()
}

const grantAuthorization = async () => {
  try {
    if (form.value.status == null) {
      snackbar.add({ type: 'error', text: 'Please provide a response for the authorization request' })
      return
    }
    loadingStore.loading = true
    const body = {
      id: form.value.auth_request.id,
      status: form.value.status,
      expires_at: form.value.expires_at,
      response: form.value.authorized_reason,
    }
    await $api.authProcessRequests.respondRequest(form.value.auth_request.id, body)

    snackbar.add({ type: 'success', text: 'Authorization process request response sent' })
    closeGrantDialog()
    await getAuthProcessRequests()
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
    const useCancelAuth = !hasPermission('process-requests-delete') &&
                          formCancel.value.auth_request?.user_id === currentUser.value?.id

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
    expires_at: null,
    is_authorized: null,
    authorized_reason: '',
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

watch(() => route.query.openChat, (val) => {
  if (val === '1') openChatFromQuery()
})
</script>
