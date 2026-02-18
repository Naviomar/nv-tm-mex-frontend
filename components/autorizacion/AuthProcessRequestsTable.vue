<template>
  <Card>
    <div class="p-4 space-y-4">
      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4" @keyup.enter="onClickFilters">
        <div class="md:col-span-2">
          <AUserSearch v-model="filters.user_id" label="Requested by" />
        </div>
        <div class="md:col-span-2">
          <Input v-model="filterIdInput" type="number" label="By ID" placeholder="ID" />
        </div>
        <div class="md:col-span-2">
          <Select v-model="filters.status" label="Status">
            <option :value="null">All</option>
            <option v-for="s in estatuses" :key="s.value" :value="s.value">{{ s.name }}</option>
          </Select>
        </div>
        <div class="md:col-span-2">
          <Select v-model="filters.deleted_status" label="Active / Inactive">
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
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Process</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Reason</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Status</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Expiration date</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Granted by</th>
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
            <td class="px-3 py-2 whitespace-nowrap text-zinc-900 dark:text-zinc-100">{{ authRequest.user?.name }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
              {{ authRequest.display_name || authRequest.process_name_key }}
            </td>
            <td class="px-3 py-2 text-zinc-600 dark:text-zinc-400">{{ authRequest.reason || 'No comments' }}</td>
            <td class="px-3 py-2">
              <Badge variant="warning">{{ authRequest.status }}</Badge>
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{{ formatDateString(authRequest.expires_at) }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{{ authRequest.grantor?.name }}</td>
            <td class="px-3 py-2 whitespace-nowrap">
              <UserInfoBadge :item="authRequest" created-by-key="user_id">
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
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Grant process authorization</h3>
        </div>
        <div class="p-4 overflow-y-auto space-y-4">
          <div class="rounded-md border-2 border-dashed border-zinc-200 dark:border-zinc-700 p-3 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
            <p><span class="font-medium text-zinc-700 dark:text-zinc-300">Process:</span> {{ form.auth_request?.display_name || form.auth_request?.process_name_key }}</p>
            <p><span class="font-medium text-zinc-700 dark:text-zinc-300">Requested by:</span> {{ form.auth_request?.user?.name }}</p>
            <p><span class="font-medium text-zinc-700 dark:text-zinc-300">Comments:</span> {{ form.auth_request?.reason || 'No comments' }}</p>
          </div>
          <Select v-model="form.status" label="Grant or deny?">
            <option :value="null">—</option>
            <option value="pending">Pending</option>
            <option value="granted">Grant</option>
            <option value="denied">Deny</option>
          </Select>
          <Input
            v-if="form.status === 'granted'"
            v-model="formExpiresAtInput"
            type="datetime-local"
            label="Expires at"
          />
          <p v-if="form.status === 'granted'" class="text-xs text-zinc-500 dark:text-zinc-400">Please provide an expiration date for the authorization.</p>
          <Textarea v-model="form.authorized_reason" label="Comments" :rows="3" placeholder="Optional" />
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
import { deletedStatus } from '~/utils/data/systemData'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref<{
  id: string | null
  search: string
  status: string | null
  deleted_status: string | null
  user_id?: number
}>({
  id: null,
  search: '',
  status: null,
  deleted_status: null,
  user_id: undefined,
})

const filterIdInput = computed({
  get: () => filters.value.id ?? '',
  set: (v: string) => { filters.value.id = v === '' ? null : v },
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

const form = ref<{
  auth_request: any
  expires_at: string | null
  status: string | null
  authorized_reason: string
}>({
  auth_request: null,
  expires_at: null,
  status: null,
  authorized_reason: '',
})

const formExpiresAtInput = computed({
  get: () => form.value.expires_at ?? '',
  set: (v: string) => { form.value.expires_at = v || null },
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
  await getAuthProcessRequests()
}

const isPendingToGrant = (authRequest: any) => {
  return authRequest.status == 'pending'
}

const preGrantAuth = async () => {
  if (!form.value.status) {
    snackbar.add({ type: 'error', text: 'Please provide a response for the authorization request' })
    return
  }
  await grantAuthorization()
}

const grantAuthorization = async () => {
  try {
    if (!form.value.status) {
      snackbar.add({ type: 'error', text: 'Please provide a response for the authorization request' })
      return
    }
    loadingStore.loading = true
    const body = {
      id: form.value.auth_request.id,
      status: form.value.status,
      expires_at: form.value.expires_at || null,
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
    // TODO: Unused variable response
    const _ = await $api.authProcessRequests.cancelRequest(formCancel.value.auth_request.id, {
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
  form.value.auth_request = null
  form.value.expires_at = null
  form.value.status = null
  form.value.authorized_reason = ''
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
  filters.value.id = null
  filters.value.search = ''
  filters.value.status = null
  filters.value.deleted_status = null
  filters.value.user_id = undefined
  authRequests.value.current_page = 1
  await getAuthProcessRequests()
}

onMounted(async () => {
  await getAuthProcessRequests()
  await getAuthReqProcessCatalogs()
})
</script>
