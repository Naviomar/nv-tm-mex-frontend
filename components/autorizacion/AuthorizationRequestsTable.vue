<template>
  <Card>
    <div class="p-4 space-y-4">
      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4" @keyup.enter="onClickFilters">
        <div class="md:col-span-2">
          <Input v-model="filterIdInput" type="number" label="By ID" placeholder="ID" />
        </div>
        <div class="md:col-span-2">
          <Input v-model="filters.search" label="Search in comments" placeholder="Search…" />
        </div>
        <div class="md:col-span-2">
          <Select v-model="filters.requestedBy" label="Requested by">
            <option :value="null">All</option>
            <option v-for="u in catalogs.users" :key="u.id" :value="u.id">{{ u.name }}</option>
          </Select>
        </div>
        <div class="md:col-span-2">
          <Select v-model="filters.deleted_status" label="Status">
            <option :value="null">All</option>
            <option v-for="s in deletedStatus" :key="s.value" :value="s.value">{{ s.name }}</option>
          </Select>
        </div>
      </div>
      <div class="flex gap-2">
        <Button variant="secondary" size="sm" @click="clearFilters">Clear</Button>
        <Button variant="primary" size="sm" @click="onClickFilters">Search</Button>
      </div>

      <Pagination
        :current-page="authRequests.current_page"
        :total-pages="authRequests.last_page"
        @update:current-page="onClickPagination"
      />
      <p class="text-xs text-zinc-500 dark:text-zinc-400">
        Showing {{ authRequests.from }} to {{ authRequests.to }} from {{ authRequests.total }} total records
      </p>

      <Table rounded="lg" scroll>
        <thead>
          <tr class="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50">
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400 w-16">ID</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400 w-24">Actions</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Requested by</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Resource</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Comments</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Attachment(s)</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Granted?</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Used?</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Expired?</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Expiration date</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">User auth</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(authRequest, index) in authRequests.data"
            :key="`authRequest-${index}`"
            :class="[
              'border-b border-zinc-100 dark:border-zinc-800/80',
              authRequest.deleted_at ? 'bg-red-50/50 dark:bg-red-950/20' : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30'
            ]"
          >
            <td class="px-3 py-2 text-zinc-900 dark:text-zinc-100">{{ authRequest.id }}</td>
            <td class="px-3 py-2">
              <div v-if="isPendingToGrant(authRequest) && !authRequest.deleted_at">
                <Button variant="primary" size="sm" class="w-24" @click="showFormGrant(authRequest)">Respond</Button>
              </div>
              <div v-else-if="!isPendingToGrant(authRequest) && !authRequest.deleted_at">
                <Button variant="danger" size="sm" class="w-24" @click="showFormCancel(authRequest)">Delete</Button>
              </div>
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-zinc-900 dark:text-zinc-100">{{ authRequest.requested?.name }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
              {{ getResourceName(authRequest.resource) }} #{{ authRequest.invoice_number || authRequest.resource_id }}
            </td>
            <td class="px-3 py-2 text-zinc-600 dark:text-zinc-400">{{ authRequest.request_reason }}</td>
            <td class="px-3 py-2">
              <div v-if="!authRequest.files?.length">
                <Badge variant="warning">No attachments</Badge>
              </div>
              <div v-else class="flex flex-col gap-1">
                <ButtonDownloadS3Object v-for="(file, fi) in authRequest.files" :key="`file-${fi}`" :s3-path="file.attachment" />
              </div>
            </td>
            <td class="px-3 py-2">
              <div v-if="authRequest.is_authorized == null">
                <Badge variant="warning">Pending</Badge>
              </div>
              <div v-else>
                <Badge :variant="authRequest.is_authorized == 1 ? 'success' : 'error'">
                  {{ authRequest.is_authorized == 1 ? 'Yes' : 'No' }}
                </Badge>
                <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{{ authRequest.authorized_reason }}</div>
              </div>
            </td>
            <td class="px-3 py-2">
              <Badge v-if="authRequest.used_at" variant="default">{{ formatDateString(authRequest.used_at) }}</Badge>
            </td>
            <td class="px-3 py-2">
              <Badge v-if="!authRequest.used_at" variant="default">{{ authRequest.expired ? 'Yes' : 'No' }}</Badge>
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{{ formatDateString(authRequest.expires_at) }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{{ authRequest.authorized?.name }}</td>
            <td class="px-3 py-2 whitespace-nowrap">
              <UserInfoBadge :item="authRequest" created-by-key="requested_by">
                {{ formatDateString(authRequest.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </Table>

      <Pagination
        :current-page="authRequests.current_page"
        :total-pages="authRequests.last_page"
        @update:current-page="onClickPagination"
      />
    </div>
  </Card>

  <!-- Grant dialog -->
  <Teleport to="body">
    <div
      v-if="showGrantDialog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="closeGrantDialog"
    >
      <Card class="w-full max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Grant authorization</h3>
        </div>
        <div class="p-4 overflow-y-auto space-y-4">
          <div class="rounded-md border-2 border-dashed border-zinc-200 dark:border-zinc-700 p-3 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
            <p><span class="font-medium text-zinc-700 dark:text-zinc-300">Resource:</span> {{ getResourceName(form.auth_request?.resource) }}</p>
            <p><span class="font-medium text-zinc-700 dark:text-zinc-300">Reference:</span> #{{ form.auth_request?.invoice_number || form.auth_request?.resource_id }}</p>
            <p><span class="font-medium text-zinc-700 dark:text-zinc-300">Requested by:</span> {{ form.auth_request?.requested?.name }}</p>
            <p><span class="font-medium text-zinc-700 dark:text-zinc-300">Comments:</span> {{ form.auth_request?.request_reason }}</p>
          </div>
          <Select v-model="form.is_authorized" label="Grant or reject?">
            <option :value="null">—</option>
            <option :value="1">Yes</option>
            <option :value="0">No</option>
          </Select>
          <Input
            v-if="form.is_authorized === 1"
            v-model="form.until_date"
            type="date"
            label="Until date granted"
          />
          <Textarea v-model="form.authorized_reason" label="Comments" placeholder="Optional comments" />
        </div>
        <div class="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-2">
          <Button variant="secondary" @click="closeGrantDialog">Cancel</Button>
          <Button variant="primary" @click="preGrantAuth">Save response</Button>
        </div>
      </Card>
    </div>
  </Teleport>

  <!-- Cancel dialog -->
  <Teleport to="body">
    <div
      v-if="showCancelDialog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="closeCancelDialog"
    >
      <Card class="w-full max-w-[500px]">
        <div class="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Cancel authorization request</h3>
        </div>
        <div class="p-4 text-sm text-zinc-600 dark:text-zinc-400">
          Please confirm the delete of the authorization request.
        </div>
        <div class="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-2">
          <Button variant="secondary" @click="closeCancelDialog">Cancel</Button>
          <Button variant="primary" @click="cancelAuthorization">Yes, I confirm.</Button>
        </div>
      </Card>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { getAuthResourceByName } from '~/utils/data/system'
import { deletedStatus } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const authRequestStore = useAuthRequestStore()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref<{
  id: string | null
  search: string
  deleted_status: string | null
  requestedBy: number | null
}>({
  id: null,
  search: '',
  deleted_status: null,
  requestedBy: null,
})

const filterIdInput = computed({
  get: () => filters.value.id ?? '',
  set: (v: string) => { filters.value.id = v === '' ? null : v },
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
  data: [],
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0,
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
    // TODO: Unused variable response
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
  filters.value.id = null
  filters.value.search = ''
  filters.value.deleted_status = null
  filters.value.requestedBy = null
  authRequests.value.current_page = 1
  await getAuthRequests()
}

onMounted(async () => {
  await getAuthRequests()
  await getAuthReqCatalogs()
})
</script>
