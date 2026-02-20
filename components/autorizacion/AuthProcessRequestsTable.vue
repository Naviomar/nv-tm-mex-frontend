<template>
  <v-card variant="flat">
    <v-card-text>
      <div class="mb-4" @keyup.enter="onClickFilters">
        <div class="grid grid-cols-6 gap-4">
          <div class="col-span-2">
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
            <th class="text-left" width="50">Actions</th>
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
            }"
          >
            <td>
              {{ authRequest.id }}
            </td>
            <td>
              <div v-if="isPendingToGrant(authRequest) && !authRequest.deleted_at">
                <v-btn color="primary" size="x-small" @click="showFormGrant(authRequest)"> Respond </v-btn>
              </div>
              <div v-if="!isPendingToGrant(authRequest) && !authRequest.deleted_at">
                <v-btn color="red" size="x-small" @click="showFormCancel(authRequest)"> Delete </v-btn>
              </div>
            </td>
            <td class="whitespace-nowrap">{{ authRequest.user?.name }}</td>
            <td class="whitespace-nowrap">
              {{ authRequest.resolved_display }}
            </td>
            <td class="whitespace-nowrap">{{ authRequest.reason || 'No comments' }}</td>

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
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const authRequestStore = useAuthRequestStore()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const processTypeItems = Object.values(processResources)

const filters = ref<any>({
  id: null,
  search: '',
  deleted_status: null,
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

const cancelAuthorization = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.authProcessRequests.cancelRequest(formCancel.value.auth_request.id, {
      cancel_reason: formCancel.value.cancel_reason,
    })

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
    deleted_status: null,
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
})
</script>
