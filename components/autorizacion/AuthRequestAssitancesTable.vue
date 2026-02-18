<template>
  <Card>
    <div class="p-4 space-y-4">
      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4" @keyup.enter="onClickFilters">
        <div class="md:col-span-2">
          <AUserSearch v-model="filters.created_by" label="Requested by" />
        </div>
        <div class="md:col-span-2">
          <Input v-model="filters.id" type="number" label="By ID" placeholder="ID" />
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
        :current-page="reqAssistances.current_page"
        :total-pages="reqAssistances.last_page"
        @update:current-page="onClickPagination"
      />
      <p class="text-xs text-zinc-500 dark:text-zinc-400">
        Showing {{ reqAssistances.from }} to {{ reqAssistances.to }} from {{ reqAssistances.total }} total records
      </p>

      <Table rounded="lg" scroll>
        <thead>
          <tr class="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50">
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400 w-16">ID</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400 w-24">Actions</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Requested by</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Route</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Message</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Attachments</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Status</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Assisted by</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Comments</th>
            <th class="h-10 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(reqAssist, index) in reqAssistances.data"
            :key="`reqAssist-${index}`"
            :class="[
              'border-b border-zinc-100 dark:border-zinc-800/80',
              reqAssist.deleted_at
                ? 'bg-red-50/50 dark:bg-red-950/20'
                : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30',
            ]"
          >
            <td class="px-3 py-2 text-zinc-900 dark:text-zinc-100">{{ reqAssist.id }}</td>
            <td class="px-3 py-2">
              <div v-if="isPendingToGrant(reqAssist) && !reqAssist.deleted_at">
                <Button variant="primary" size="sm" class="w-24" @click="showFormGrant(reqAssist)">Respond</Button>
              </div>
              <div v-else-if="!isPendingToGrant(reqAssist) && !reqAssist.deleted_at">
                <Button variant="danger" size="sm" class="w-24" @click="showFormCancel(reqAssist)">Delete</Button>
              </div>
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-zinc-900 dark:text-zinc-100">{{ reqAssist.user?.name }}</td>
            <td class="px-3 py-2 whitespace-nowrap">
              <NuxtLink
                :to="reqAssist.route"
                target="_blank"
                class="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline"
              >
                <span class="mdi mdi-open-in-new text-sm" aria-hidden="true" />
                {{ reqAssist.route }}
              </NuxtLink>
            </td>
            <td class="px-3 py-2 text-zinc-600 dark:text-zinc-400">{{ reqAssist.message }}</td>
            <td class="px-3 py-2">
              <div v-if="!reqAssist.files?.length">
                <Badge variant="warning">No attachments</Badge>
              </div>
              <div v-else class="flex flex-col gap-1">
                <ButtonDownloadS3Object
                  v-for="(file, fileIndex) in reqAssist.files"
                  :key="`file-${fileIndex}`"
                  :s3-path="file.file_path"
                />
              </div>
            </td>
            <td class="px-3 py-2">
              <Badge variant="default">{{ reqAssist.status }}</Badge>
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
              {{ reqAssist.assisted_by?.name }}
            </td>
            <td class="px-3 py-2 text-zinc-600 dark:text-zinc-400">{{ reqAssist.comments }}</td>
            <td class="px-3 py-2 whitespace-nowrap">
              <UserInfoBadge :item="reqAssist" created-by-key="created_by">
                {{ formatDateString(reqAssist.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </Table>

      <Pagination
        :current-page="reqAssistances.current_page"
        :total-pages="reqAssistances.last_page"
        @update:current-page="onClickPagination"
      />
    </div>
  </Card>

  <!-- Grant / Assist dialog -->
  <Teleport to="body">
    <div
      v-if="showGrantDialog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="closeGrantDialog"
    >
      <Card class="w-full max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Assist Request</h3>
        </div>
        <div class="p-4 overflow-y-auto space-y-4">
          <div
            class="rounded-md border-2 border-dashed border-zinc-200 dark:border-zinc-700 p-3 text-sm text-zinc-600 dark:text-zinc-400 space-y-1"
          >
            <p><span class="font-medium text-zinc-700 dark:text-zinc-300">Route:</span> {{ form.req_assist?.route }}</p>
            <p>
              <span class="font-medium text-zinc-700 dark:text-zinc-300">Requested by:</span>
              {{ form.req_assist?.user?.name }}
            </p>
            <p>
              <span class="font-medium text-zinc-700 dark:text-zinc-300">Comments:</span>
              {{ form.req_assist?.message || 'No comments' }}
            </p>
          </div>
          <Select v-model="form.status" label="Grant or deny?">
            <option :value="null">—</option>
            <option value="open">Open</option>
            <option value="granted">Grant</option>
            <option value="denied">Deny</option>
          </Select>
          <Textarea v-model="form.comments" label="Comments" :rows="3" placeholder="Optional" />
        </div>
        <div class="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-2">
          <Button variant="secondary" @click="closeGrantDialog">Cancel</Button>
          <Button variant="primary" @click="preAssist">Save response</Button>
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
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Cancel request assistance</h3>
        </div>
        <div class="p-4 text-sm text-zinc-600 dark:text-zinc-400">
          Please confirm the delete of the request assistance.
        </div>
        <div class="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-2">
          <Button variant="secondary" @click="closeCancelDialog">Cancel</Button>
          <Button variant="primary" @click="cancelReqAssistance">Yes, I confirm.</Button>
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

const filters = ref<any>({
  id: null,
  search: '',
  deleted_status: null,
  created_by: null,
})

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

const cancelReqAssistance = async () => {
  try {
    loadingStore.loading = true
    const _ = await $api.requestAssistances.cancelRequest(formCancel.value.req_assist.id, {
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
    search: '',
    deleted_status: null,
    created_by: null,
  }
  reqAssistances.value.current_page = 1
  await getRequestAssistances()
}

await getRequestAssistances()
</script>
