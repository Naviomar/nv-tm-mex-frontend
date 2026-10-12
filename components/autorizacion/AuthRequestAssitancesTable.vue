<template>
  <v-card variant="flat">
    <v-card-text class="px-0">
      <RequestFilterCard @search="onClickFilters" @clear="clearFilters">
        <v-text-field
          v-model="filters.text"
          class="req-filters__wide"
          density="compact"
          label="Search"
          placeholder="Message, screen, requester or team response…"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
        />
        <v-text-field v-model="filters.id" type="number" density="compact" label="Request ID" hide-details />
        <div v-if="isAdminRole()">
          <AUserSearch v-model="filters.created_by" label="Requested by" />
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
          Showing {{ reqAssistances.from ?? 0 }}–{{ reqAssistances.to ?? 0 }} of {{ reqAssistances.total ?? 0 }} requests
        </div>
        <v-pagination
          v-model="reqAssistances.current_page"
          :length="reqAssistances.last_page"
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
          <col style="width: 200px" />
          <col style="width: 180px" />
          <col style="width: 360px" />
          <col style="width: 170px" />
          <col style="width: 160px" />
          <col style="width: 280px" />
        </colgroup>
        <thead>
          <tr>
            <th class="text-left">ID</th>
            <th class="text-left">Actions</th>
            <th class="text-left">Screen</th>
            <th class="text-left">Requested by</th>
            <th class="text-left">Message</th>
            <th class="text-left">Attachments</th>
            <th class="text-left">Status</th>
            <th class="text-left">Team response</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(reqAssist, index) in reqAssistances.data"
            :key="`reqAssist-${index}`"
            :class="{
              'dark:hover:bg-gray-700! hover:bg-slate-300!': true,
              'bg-red-100! dark:bg-red-900!': reqAssist.deleted_at,
              'bg-green-50! dark:bg-green-950!': !reqAssist.deleted_at && isPendingToGrant(reqAssist),
            }"
          >
            <td class="text-medium-emphasis">{{ reqAssist.id }}</td>
            <td>
              <div class="d-flex gap-1">
                <v-btn icon size="small" variant="text" color="primary" title="Open chat" @click="openChat(reqAssist)">
                  <v-badge
                    v-if="reqAssist.unread_count"
                    :content="reqAssist.unread_count"
                    color="error"
                    overlap
                  >
                    <v-icon>mdi-message-text-outline</v-icon>
                  </v-badge>
                  <v-icon v-else>mdi-message-text-outline</v-icon>
                </v-btn>
                <v-btn
                  v-if="isPendingToGrant(reqAssist) && hasPermission('support-requests-manage')"
                  icon size="small" variant="text" color="success"
                  title="Respond"
                  @click="showFormGrant(reqAssist)"
                >
                  <v-icon>mdi-check-circle-outline</v-icon>
                </v-btn>
                <v-btn
                  v-if="canDelete(reqAssist)"
                  icon size="small" variant="text" color="error"
                  title="Cancel request"
                  @click="showFormCancel(reqAssist)"
                >
                  <v-icon>mdi-close-circle-outline</v-icon>
                </v-btn>
              </div>
            </td>

            <td>
              <nuxt-link :to="`${reqAssist.route}`" target="_blank" class="d-flex align-center gap-1" :title="reqAssist.route">
                <v-icon size="14">mdi-open-in-new</v-icon>
                <span class="cell-clip">{{ reqAssist.route }}</span>
              </nuxt-link>
            </td>

            <td>
              <UserInfoBadge :item="reqAssist" createdByKey="created_by">
                <div class="cell-title">{{ reqAssist.user?.name }}</div>
                <div class="cell-sub">{{ formatDateString(reqAssist.created_at) }}</div>
              </UserInfoBadge>
            </td>

            <td>
              <ExpandableText :text="reqAssist.message" :lines="3" empty="No message" />
            </td>

            <td>
              <div v-if="!reqAssist.files?.length" class="text-caption text-disabled">No attachments</div>
              <div v-else class="d-flex flex-column gap-1">
                <ButtonDownloadS3Object v-for="(file, fileIndex) in reqAssist.files" :key="`file-${fileIndex}`" :s3Path="file.file_path" />
              </div>
            </td>

            <td>
              <RequestStatusCell :decision="supportDecision(reqAssist)" support />
              <div v-if="reqAssist.assisted_by?.name" class="cell-sub mt-1">by {{ reqAssist.assisted_by.name }}</div>
            </td>
            <td>
              <ExpandableText :text="reqAssist.comments" :lines="3" empty="No response yet" />
            </td>
          </tr>
          <tr v-if="!reqAssistances.data?.length">
            <td colspan="8" class="text-center py-8 text-medium-emphasis">No requests match the current filters.</td>
          </tr>
        </tbody>
      </v-table>
      </v-card>
      <div class="d-flex justify-end mt-2">
        <v-pagination
          v-model="reqAssistances.current_page"
          :length="reqAssistances.last_page"
          rounded="circle"
          density="compact"
          :total-visible="7"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </div>

      <v-dialog v-model="showGrantDialog" max-width="500" persistent>
        <v-card>
          <v-card-title>Assist Request</v-card-title>
          <v-card-text>
            <div class="border-4 border-dotted border-gray-300 p-2 mb-4">
              <div class="text-base">Route: {{ form.req_assist?.route }}</div>
              <div class="text-base">Requested by: {{ form.req_assist?.user?.name }}</div>
              <div class="text-base">Comments: {{ form.req_assist?.message || 'No comments' }}</div>
            </div>
            <v-autocomplete
              v-model="form.status"
              :items="[
                { text: 'Open', value: 'open' },
                { text: 'Grant', value: 'granted' },
                { text: 'Deny', value: 'denied' },
              ]"
              item-title="text"
              item-value="value"
              label="Grant or deny?"
            />
            <v-textarea v-model="form.comments" label="Comments" :rows="3" />
          </v-card-text>
          <v-card-actions>
            <div class="grow"></div>
            <v-btn color="error" @click="closeGrantDialog">Cancel</v-btn>
            <v-btn color="success" @click="preAssist">Save response</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Ticket Chat Dialog -->
      <v-dialog v-model="showChatDrawer" max-width="640">
        <v-card v-if="activeChatTicket" flat style="border-radius:12px;overflow:hidden">
          <TicketChatPanel
            ticket-type="support-assistance"
            :ticket-id="activeChatTicket.id"
            :can-manage="isAdminRole()"
            height="580px"
            @close="showChatDrawer = false"
          />
          <v-divider />
          <v-card-actions v-if="!activeChatTicket.deleted_at" class="px-4 py-2">
            <span class="text-caption text-medium-emphasis">
              #{{ activeChatTicket.id }} &mdash; {{ activeChatTicket.route }}
            </span>
            <v-spacer />
            <v-btn
              v-if="isPendingToGrant(activeChatTicket) && hasPermission('support-requests-manage')"
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
          <v-card-title>Cancel request assistance</v-card-title>
          <v-card-text> Please confirm the delete of the request assistance </v-card-text>
          <v-card-actions>
            <div class="grow"></div>
            <v-btn color="error" @click="closeCancelDialog">Cancel</v-btn>
            <v-btn color="success" @click="cancelReqAssistance">Yes, I confirm.</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { deletedStatus } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const { isAdminRole, hasPermission } = useCheckUser()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref<any>({
  id: null,
  text: '',
  status: null as string | null,
  deleted_status: 'active',
  created_by: null,
})

useDebouncedSearch(() => filters.value.text, () => onClickFilters())

const statusOptions = [
  { value: null, label: 'All', color: 'primary' },
  { value: 'open', label: 'Open', color: 'warning' },
  { value: 'granted', label: 'Attended', color: 'success' },
  { value: 'denied', label: 'Rejected', color: 'error' },
]

const setStatus = (value: string | null) => {
  filters.value.status = value
  onClickFilters()
}

const supportDecision = (reqAssist: any): 'pending' | 'granted' | 'denied' =>
  ({ granted: 'granted', denied: 'denied' } as const)[reqAssist.status as 'granted' | 'denied'] ?? 'pending'

const estatuses = ref<any>([
  { name: 'Open', value: 'open' },
  { name: 'Granted', value: 'granted' },
  { name: 'Denied', value: 'denied' },
])

const formCancel = ref<any>({
  req_assist: null,
  cancel_reason: '',
})

const form = ref<any>({
  req_assist: null,
  expires_at: null,
  is_authorized: null,
  comments: '',
})

const reqAssistances = ref<any>({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const showGrantDialog = ref(false)
const showCancelDialog = ref(false)

const showFormGrant = (reqAssist: any) => {
  form.value.req_assist = reqAssist
  showGrantDialog.value = true
}

const showFormCancel = (reqAssist: any) => {
  formCancel.value.req_assist = reqAssist
  showCancelDialog.value = true
}

const onClickPagination = async (page: number) => {
  reqAssistances.value.current_page = page
  await getRequestAssistances()
}

const isPendingToGrant = (reqAssist: any) => {
  return reqAssist.status == 'open'
}

const showChatDrawer = ref(false)
const activeChatTicket = ref<any>(null)

const openChat = (item: any) => {
  activeChatTicket.value = item
  item.unread_count = 0
  showChatDrawer.value = true
}

// TODO: Unused functions
const priorityColor = (priority: string) => {
  return { critical: 'error', high: 'deep-orange', medium: 'warning', low: 'default' }[priority] ?? 'default'
}
const ticketStatusColor = (status: string) => {
  return { open: 'primary', pending_info: 'warning', in_review: 'info', resolved: 'success', closed: 'default' }[status] ?? 'primary'
}

const preAssist = async () => {
  if (form.value.status == null) {
    snackbar.add({ type: 'error', text: 'Please provide a response for the request assistance' })
    return
  }
  await assistSaveReq()
}

const assistSaveReq = async () => {
  try {
    if (form.value.status == null) {
      snackbar.add({ type: 'error', text: 'Please provide a response for the request assistance' })
      return
    }
    loadingStore.loading = true
    const body = {
      id: form.value.req_assist.id,
      status: form.value.status,
      response: form.value.comments,
    }
    await $api.requestAssistances.respondRequest(form.value.req_assist.id, body)

    snackbar.add({ type: 'success', text: 'Request assistance response updated.' })
    closeGrantDialog()
    await getRequestAssistances()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const canDelete = (reqAssist: any) => {
  if (!reqAssist) return false
  return hasPermission('support-requests-manage')
}

const cancelReqAssistance = async () => {
  try {
    loadingStore.loading = true
    await $api.requestAssistances.cancelRequest(formCancel.value.req_assist.id, {
      cancel_reason: formCancel.value.cancel_reason,
    })

    snackbar.add({ type: 'success', text: 'Authorization request canceled' })
    closeCancelDialog()
    await getRequestAssistances()
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
    req_assist: null,
    expires_at: null,
    is_authorized: null,
    comments: '',
  }
}

const closeCancelDialog = () => {
  showCancelDialog.value = false
  formCancel.value = {
    req_assist: null,
    cancel_reason: '',
  }
}

const onClickFilters = async () => {
  // set current page to 1
  reqAssistances.value.current_page = 1
  await getRequestAssistances()
}

const getRequestAssistances = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.requestAssistances.getRequests({
      query: {
        page: reqAssistances.value.current_page,
        perPage: reqAssistances.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    reqAssistances.value = response as any
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

const clearFilters = async () => {
  filters.value = {
    id: null,
    text: '',
    status: null,
    deleted_status: 'active',
    created_by: null,
  }
  reqAssistances.value.current_page = 1
  await getRequestAssistances()
}

await getRequestAssistances()

const openChatFromQuery = () => {
  const ticketId = route.query.ticketId ? Number(route.query.ticketId) : null
  if (!ticketId || route.query.openChat !== '1') return
  const row = reqAssistances.value.data.find((r: any) => r.id === ticketId)
  openChat(row ?? { id: ticketId })
  router.replace({ query: { ...route.query, openChat: undefined, ticketId: undefined } })
}
openChatFromQuery()

watch(() => route.query.openChat, (val) => {
  if (val === '1') openChatFromQuery()
})
</script>
