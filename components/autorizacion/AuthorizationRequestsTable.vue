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
            <th class="text-left">Resource</th>
            <th class="text-left">Comments</th>
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
            }"
          >
            <td>
              {{ authRequest.id }}
            </td>
            <td>
              <div v-if="isPendingToGrant(authRequest) && !authRequest.deleted_at">
                <v-btn color="primary" size="small" @click="showFormGrant(authRequest)"> Respond </v-btn>
              </div>
              <div v-if="!isPendingToGrant(authRequest) && !authRequest.deleted_at">
                <v-btn color="red" size="small" @click="showFormCancel(authRequest)"> Delete </v-btn>
              </div>
            </td>
            <td class="whitespace-nowrap">{{ authRequest.requested?.name }}</td>
            <td class="whitespace-nowrap">
              {{ getResourceName(authRequest.resource) }} #{{ authRequest.invoice_number || authRequest.resource_id }}
            </td>
            <td>{{ authRequest.request_reason }}</td>
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

      <v-dialog v-model="showGrantDialog" max-width="500" persistent>
        <v-card>
          <v-card-title>Grant authorization</v-card-title>
          <v-card-text>
            <div class="border-4 border-dotted border-gray-300 p-2 mb-4">
              <div class="text-base">Resource: {{ getResourceName(form.auth_request?.resource) }}</div>
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
import { authorizeResources, getAuthResourceByName } from '~/utils/data/system'
import { deletedStatus } from '~/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const authRequestStore = useAuthRequestStore()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref({
  id: null,
  search: '',
  deleted_status: null,
  requestedBy: null,
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
  await getAuthRequests()
}

const isPendingToGrant = (authRequest: any) => {
  return authRequest.is_authorized == null
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
    deleted_status: null,
    requestedBy: null,
  }
  authRequests.value.current_page = 1
  await getAuthRequests()
}

onMounted(async () => {
  await getAuthRequests()
  await getAuthReqCatalogs()
})
</script>
